# Elixir Services Audit

## Overview

This document covers the audit of Elixir services: `auth_verifier` and `chat`.

**Note:** `notifications` service is skipped (currently being reworked in a separate branch).

---

## 1. `auth_verifier`

**Purpose:** Shared library for JWT verification using Authentik JWKS.

### Structure
```
lib/auth_verifier/
├── token.ex           # Joken config with claims validation
└── token_strategy.ex  # JWKS fetching strategy
```

### Strengths
- Uses `joken_jwks` for automatic JWKS caching and refresh
- Validates `iss` and `aud` claims
- Clean, minimal implementation

### Issues

#### 1. JWKS refresh interval is very short

```elixir
def init_opts(opts) do
  [
    jwks_url: url,
    time_interval: 5_000,  # 5 seconds
    log_level: :debug
  ]
end
```

**Risk:** Excessive requests to Authentik. JWKS keys rarely change.

**Fix:** Increase to 5-15 minutes:

```elixir
time_interval: 300_000  # 5 minutes
```

#### 2. No error handling for missing config

```elixir
def token_config do
  expected_iss = Application.fetch_env!(:auth_verifier, :issuer)  # Crashes if missing
  expected_aud = Application.fetch_env!(:auth_verifier, :audience)
```

This is acceptable for startup validation, but consider adding a startup check with a clear error message.

---

## 2. `chat`

**Purpose:** Real-time chat service using Phoenix Channels.

### Structure
```
lib/
├── chat/
│   ├── application.ex    # OTP application
│   ├── chat_channel.ex   # Main channel logic (~300 lines)
│   ├── user_socket.ex    # WebSocket authentication
│   ├── presence.ex       # Phoenix Presence
│   ├── messages/         # Message context
│   └── users/            # User context
└── chat_web/
    ├── endpoint.ex       # Phoenix endpoint
    └── router.ex         # HTTP routes (mostly empty)
```

### Strengths
- Proper JWT authentication in socket connect
- Phoenix Presence for typing indicators and online status
- Pagination with cursor-based approach (`before`/`after`)
- Soft delete for messages (`deleted_at`)
- Reply-to functionality
- Message pinning

### Issues

#### 1. Duplicated code in `get_messages_before`

```elixir
def get_messages_before(task_id, before_date \\ nil, limit \\ 50) do
  # ...
  {messages, has_more}  # First return (line 40)

  has_more =            # Duplicated calculation (lines 42-50)
    if not Enum.empty?(messages) do
      # ...
    end

  {messages, has_more}  # Second return (line 52)
end
```

**Fix:** Remove the duplicate block (lines 40-41).

#### 2. Generic error handling exposes internal errors

```elixir
def handle_in("get_all", %{"after" => after_date} = params, socket) do
  try do
    # ...
  rescue
    e -> {:reply, {:error, e}, socket}  # Exposes full exception
  end
end
```

**Risk:** Internal errors leak to clients.

**Fix:** Log the error and return generic message:

```elixir
rescue
  e ->
    Logger.error("get_all failed: #{inspect(e)}")
    {:reply, {:error, %{reason: "Internal error"}}, socket}
end
```

#### 3. No authorization check for chat access

```elixir
def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
  case Chat.Users.get_user_by_id(user_id) do
    nil -> {:error, %{reason: "User not found"}}
    user -> {:ok, socket}  # No check if user has access to this chat
  end
end
```

**Risk:** Any authenticated user can join any chat.

**Fix:** Add access check:

```elixir
def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
  with user when not is_nil(user) <- Chat.Users.get_user_by_id(user_id),
       true <- Chat.has_access?(user_id, chat_id) do
    {:ok, assign(socket, :user, user) |> assign(:chat_id, chat_id)}
  else
    nil -> {:error, %{reason: "User not found"}}
    false -> {:error, %{reason: "Access denied"}}
  end
end
```

#### 4. `user_id` from params instead of socket

```elixir
def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
```

The `user_id` is taken from client params, but socket already has `user_id` from JWT:

```elixir
def connect(%{"token" => token}, socket, _connect_info) do
  {:ok, assign(socket, :user_id, sub)}  # Already authenticated
end
```

**Risk:** Client can potentially impersonate another user.

**Fix:** Use the authenticated user_id from socket:

```elixir
def join("chat:" <> chat_id, _params, socket) do
  user_id = socket.assigns.user_id
  # ...
end
```

#### 5. Hardcoded signing salt in endpoint

```elixir
@session_options [
  store: :cookie,
  key: "_chat_key",
  signing_salt: "EU+He3Fl",  # Hardcoded
  same_site: "Lax"
]
```

**Fix:** Move to config or environment variable.

#### 6. No rate limiting

No protection against message spam or API abuse.

**Fix:** Consider adding rate limiting per user:

```elixir
# Using a simple GenServer or ETS-based rate limiter
defp rate_limited?(user_id) do
  # Check if user exceeded N messages per minute
end
```

#### 7. `chat_id` is actually `task_id`

The code uses `chat_id` in channel but `task_id` in database queries:

```elixir
def join("chat:" <> chat_id, ...) do
  socket |> assign(:chat_id, chat_id)
end

# But in Messages:
def get_messages_before(task_id, ...) do
  where: m.task_id == ^task_id
end
```

**Fix:** Rename for consistency. If chats are per-task, use `task_id` everywhere.

#### 8. No message length validation

```elixir
def handle_in("create", payload, socket) do
  text = Map.get(payload, "text")
  # No validation on text length
  Chat.Messages.create_message(chat_id, user_id, text, reply_to)
end
```

**Fix:** Add validation in changeset or before insert.

#### 9. Presence typo in filename

```
presenсe.ex  # Contains Cyrillic 'с' instead of Latin 'c'
```

This might cause issues on some systems.

**Fix:** Rename to `presence.ex`.

---

## Summary

| Priority | Issue | Service | Action |
|----------|-------|---------|--------|
| 🔴 High | User can join any chat | chat | Add access check |
| 🔴 High | `user_id` from params, not socket | chat | Use socket.assigns.user_id |
| 🟡 Medium | Errors exposed to clients | chat | Log and return generic error |
| 🟡 Medium | No rate limiting | chat | Add rate limiter |
| 🟡 Medium | No message length validation | chat | Add validation |
| 🟢 Low | JWKS refresh too frequent | auth_verifier | Increase interval |
| 🟢 Low | Duplicated code in get_messages_before | chat | Remove duplicate |
| 🟢 Low | Hardcoded signing salt | chat | Move to config |
| 🟢 Low | Inconsistent naming (chat_id vs task_id) | chat | Rename for consistency |
| 🟢 Low | Filename typo (presenсe.ex) | chat | Rename file |
