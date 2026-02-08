import Config

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.

config :chat, Chat.Repo,
  url: System.get_env("DATABASE_URL") || "ecto://postgres:postgres@localhost:1234/chat_dev",
  stacktrace: false,
  show_sensitive_data_on_connection_error: false,
  pool_size: 10

config :chat, ChatWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {0, 0, 0, 0}, port: 8078],
  check_origin: false,
  code_reloader: false,
  debug_errors: false,
  secret_key_base: "V1jyG72OT7aaBGxV/1mi1zNYKXhCNDlDdXmIeolZmCrAk59NqUWTo0zxJZNv1GgT",
  watchers: [],
  server: true
