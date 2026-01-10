# Frontend Application Audit

## Overview

This document covers the audit of the main frontend application `task-manager`.

**Stack:** React 19, Vite, React Router, TanStack Query, Zustand, Valtio, Ant Design, TipTap, oidc-client-ts

---

## Architecture

```
src/
├── app/           # App setup, providers, router, stores
├── pages/         # Page components (profile, page, workspace)
├── shared/        # Shared utilities, HOCs, UI components
└── widgets/       # Reusable complex components
```

### Strengths
- Clean FSD-like structure (Feature-Sliced Design)
- Lazy loading for pages
- Proper OIDC integration with Authentik
- Dark/light theme with persistence
- Drag-and-drop for task board (Atlaskit)
- TipTap for rich text editing

---

## Issues

### 1. 🔴 Hardcoded socket URL

```typescript
export const useChatSocketStore = createSocketStore("http://localhost:8078/socket");
```

**Location:** `src/app/store/socket.ts:81`

**Fix:** Use environment variable:

```typescript
export const useChatSocketStore = createSocketStore(
    import.meta.env.VITE_CHAT_SOCKET_URL || "http://localhost:8078/socket"
);
```

---

### 2. 🔴 `debugger` statement in production code

```typescript
if (!user && !identity) {
    debugger;  // Left in production code!
    userManager.signinRedirect();
    return <FullSizeLoader />;
}
```

**Location:** `src/shared/HOCs/withAuthPageCheck.tsx:19`

**Fix:** Remove `debugger` statement.

---

### 3. 🔴 Client ID committed to repository

```
VITE_CLIENT_ID=b6cFFalJUQQJgIM5szQC64mflsakpv8UCQJMUhLD
```

**Location:** `.env`

**Risk:** While OIDC client IDs are not secret, committing them can lead to environment confusion.

**Fix:** Use `.env.example` with placeholder values, add `.env` to `.gitignore`.

---

### 4. 🟡 StrictMode disabled

```typescript
createRoot(document.getElementById("root")!).render(
    // <StrictMode>
    <Providers>
        <App />
    </Providers>
    // </StrictMode>
);
```

**Location:** `src/main.tsx:14-19`

**Risk:** Missing double-render checks that catch bugs in development.

**Fix:** Enable StrictMode unless there's a specific reason to disable it.

---

### 5. 🟡 Unsafe type assertions

```typescript
user: undefined as unknown as User & { workspace: Workspace },
identity: undefined as unknown as OidcUser,
```

**Location:** `src/app/store/auth.ts:25-27`

**Risk:** Runtime errors if accessed before initialization.

**Fix:** Use proper optional types:

```typescript
user: User & { workspace: Workspace } | undefined,
identity: OidcUser | undefined,
```

---

### 6. 🟡 Non-null assertions without guards

```typescript
const pageId = useParams<{ id: string }>().id!;
```

**Location:** `src/pages/page/index.tsx:24`

**Risk:** Crash if route doesn't have `id` param.

**Fix:** Add guard:

```typescript
const { id: pageId } = useParams<{ id: string }>();
if (!pageId) return <Navigate to="/profile" />;
```

---

### 7. 🟡 Error swallowed in query

```typescript
queryFn: () =>
    getPage({...}).catch(error => {
        navigate("/profile", { replace: true });
        return error;  // Returns error object as data
    })
```

**Location:** `src/pages/page/index.tsx:30-40`

**Risk:** Error object becomes page data, causing unexpected behavior.

**Fix:** Use `onError` callback or throw:

```typescript
queryFn: () => getPage({...}),
onError: () => navigate("/profile", { replace: true })
```

Or with React Query v5:

```typescript
throwOnError: true,
// Handle in error boundary
```

---

### 8. 🟡 Custom event for cross-component communication

```typescript
document.dispatchEvent(new CustomEvent("createTask", { detail: { status } }));
```

**Location:** `src/pages/page/BoardPage/widgets/TaskTable/index.tsx:79`

**Risk:** Hard to trace, no type safety, bypasses React data flow.

**Fix:** Use Zustand store or React context for task creation state.

---

### 9. 🟡 Missing dependency in useEffect

```typescript
useEffect(() => {
    return monitorForElements({
        // uses changeTaskStatus
    });
}, [changeTaskStatus]);  // OK, but check all deps
```

**Location:** `src/pages/page/BoardPage/widgets/TaskTable/index.tsx:88-133`

The effect looks correct, but verify all callbacks are stable.

---

### 10. 🟡 Commented out mobile layout

```typescript
const DesktopLayout = lazySuspense(() => import("./Desktop"), <FullSizeLoader />);
// const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

// ...

return /* mobileLayout ? <MobileLayout /> :  */ <DesktopLayout />;
```

**Location:** `src/widgets/Layout/index.tsx`

**Fix:** Either implement mobile layout or remove dead code.

---

### 11. 🟡 Commented out notification socket

```typescript
// const signalsChannel = useNotificationSocketStore.getState().getChannel("signals");
// signalsChannel.on("message", console.log);
```

**Location:** `src/widgets/Layout/index.tsx:36-38`

**Fix:** Remove if not used, or implement properly.

---

### 12. 🟢 `today` constant may become stale

```typescript
export const today = dayjs();
```

**Location:** `src/shared/constants.ts:7`

**Risk:** If app runs for extended periods, `today` becomes outdated.

**Fix:** Use function instead:

```typescript
export const getToday = () => dayjs();
```

---

### 13. 🟢 QueryClient outside component

```typescript
const queryClient = new QueryClient({...});

const Providers: React.FC<ProvidersProps> = props => {
    // ...
    <QueryClientProvider client={queryClient}>
```

**Location:** `src/app/Providers.tsx:15-37`

This is actually fine for most cases, but be aware it persists across HMR.

---

### 14. 🟢 Unused `authRequired` parameter

```typescript
export const withAuthPageCheck = <P extends object>(
    Component: React.ComponentType<P>,
    authRequired = true  // Never used
) => {
```

**Location:** `src/shared/HOCs/withAuthPageCheck.tsx:7-9`

**Fix:** Either use the parameter or remove it.

---

### 15. 🟢 WYDR in dev only

```typescript
if (import.meta.env.DEV) {
    import("./wydr").then(init);
} else {
    init();
}
```

**Location:** `src/main.tsx:50-54`

This is fine, but ensure `wydr.ts` doesn't have side effects that affect production builds.

---

## File Structure Issues

### Large widget directories

```
widgets/
├── MDEditor/ (22 items)
├── Layout/ (15 items)
└── ...
```

Consider further decomposition if these grow.

---

## Summary

| Priority | Issue | Location | Action |
|----------|-------|----------|--------|
| 🔴 High | Hardcoded chat socket URL | store/socket.ts | Use env variable |
| 🔴 High | `debugger` in production | withAuthPageCheck.tsx | Remove |
| 🔴 High | Client ID in .env | .env | Use .env.example |
| 🟡 Medium | StrictMode disabled | main.tsx | Enable |
| 🟡 Medium | Unsafe type assertions | store/auth.ts | Use optional types |
| 🟡 Medium | Non-null assertions | pages/page/index.tsx | Add guards |
| 🟡 Medium | Error swallowed in query | pages/page/index.tsx | Use onError |
| 🟡 Medium | CustomEvent for state | TaskTable/index.tsx | Use Zustand |
| 🟡 Medium | Commented out mobile layout | Layout/index.tsx | Implement or remove |
| 🟡 Medium | Dead notification code | Layout/index.tsx | Remove or implement |
| 🟢 Low | Stale `today` constant | constants.ts | Use function |
| 🟢 Low | Unused `authRequired` param | withAuthPageCheck.tsx | Use or remove |
