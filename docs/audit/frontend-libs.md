# Frontend Libraries Audit

## Overview

This document covers the audit of shared frontend libraries in `libs/frontend/`.

---

## Libraries Summary

| Library                       | Purpose                              | Status |
| ----------------------------- | ------------------------------------ | ------ |
| `api`                         | API client with axios                | Active |
| `chat`                        | Chat component with virtualized list | Active |
| `react-utils`                 | React hooks and HOCs                 | Active |
| `utils`                       | General utilities                    | Active |
| `context-menu`                | Custom context menu system           | Active |
| `ant-config`                  | Ant Design theme configs             | Active |
| `tiptap-file-upload-plugin`   | TipTap file upload extension         | Active |
| `tiptap-plugin-file-renderer` | TipTap file renderer                 | Active |
| `video-player`                | Custom video player                  | Active |
| `ant-validation`              | Form validation helpers              | Active |

---

## 1. `api`

**Purpose:** Centralized API client using axios.

### Structure

```
src/
├── api/           # API endpoints by entity
├── types.ts       # Shared types
├── parseError.ts  # Error parsing utility
└── index.ts
```

### Strengths

- Clean separation by entity
- Type-safe request/response with generics
- Token injection via interceptor
- Error parsing utility

### Issues

#### 1. Hardcoded base URL

```typescript
export const axiosInstance = axios.create({
	baseURL: "http://localhost:8080"
});
```

**Fix:** Use environment variable:

```typescript
export const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080"
});
```

#### 2. Dead auth endpoints

```typescript
export const login = async (body: { username: string; password: string }) =>
	(await axiosInstance.post<User>("/auth/login", body)).data;

export const signUp = async (body: { username: string; email: string; password: string }) =>
	(await axiosInstance.post<User>("/auth/register", body)).data;
```

These endpoints don't exist in the backend (using Authentik now).

**Fix:** Remove or mark as deprecated.

#### 3. Inconsistent naming: `pathParams` for query params

```typescript
export const getWorkspaceList = async <T>(params: GetWorkspaceListRequest<T>) =>
    (await axiosInstance.get<...>("/workspaces", {
        params: params.pathParams  // Actually query params, not path params
    })).data;
```

**Fix:** Rename to `queryParams` for clarity.

#### 4. `ApiError.message` doesn't exist in backend response

```typescript
export interface ApiError {
	error: string;
	message: string; // Backend sends 'error', not 'message'
	errorCode: string;
	statusCode: number;
}
```

**Fix:** Align with actual backend response structure.

---

## 2. `chat`

**Purpose:** Full-featured chat component with virtualized scrolling.

### Structure

```
src/
├── Chat.tsx       # Main component (~525 lines)
├── state.ts       # Valtio store
├── types.ts       # Type definitions
├── hooks/         # Custom hooks
├── ui/            # Sub-components
└── utils/         # Message list processors
```

### Strengths

- Virtualized list with `react-virtuoso` for performance
- Bidirectional infinite scroll
- Presence/typing indicators
- Message pinning
- Reply-to functionality
- Grouped by date

### Issues

#### 1. Component is too large (525 lines)

`Chat.tsx` handles too many responsibilities.

**Fix:** Extract into smaller components:

- `ChatMessageList` — virtuoso list
- `ChatControls` — scroll to bottom, new messages indicator
- Custom hooks for message loading logic

#### 2. `eslint-disable max-lines` at top

```typescript
/* eslint-disable max-lines */
```

This is a code smell indicating the file needs refactoring.

#### 3. Global store without cleanup

```typescript
export const chatStore = proxy<ChatStore>({
	firstItemIndex: INITIAL_MAX_ITEMS - INITIAL_LIMIT
	// ...
});
```

Store is global and persists between chat instances.

**Fix:** Reset store on unmount or use component-scoped state.

#### 4. Magic number

```typescript
export const INITIAL_MAX_ITEMS = 1_000_000;
```

**Fix:** Add comment explaining why this value.

---

## 3. `react-utils`

**Purpose:** Reusable React hooks and HOCs.

### Hooks

- `useClickOutside` — Detect clicks outside element
- `useDebouncedEffect` — Debounced useEffect
- `useDisclosure` — Boolean state with open/close/toggle
- `useFunctionWithFeedback` — Wrap function with error/success messages
- `useIntersectionObserver` — Intersection Observer hook
- `useLocalStorage` — Persist state to localStorage
- `useStorage` — Generic storage hook
- `useWindowResize` — Window resize listener

### Strengths

- Well-tested (has `__tests__` folder)
- Clean implementations
- Good TypeScript types

### Issues

#### 1. `useLocalStorage` doesn't handle SSR

```typescript
const [value, setValue] = useState<T>(() => {
	const storedValue = localStorage.getItem(key); // Crashes in SSR
	// ...
});
```

**Fix:** Add SSR check:

```typescript
const [value, setValue] = useState<T>(() => {
	if (typeof window === "undefined") return initialValue;
	// ...
});
```

Note: May not be relevant if not using SSR.

---

## 4. `context-menu`

**Purpose:** Custom context menu system with WeakMap registry.

### Architecture

- **Core:** Framework-agnostic registry using WeakMap
- **React:** React component wrapper

### Strengths

- Clean separation of core logic and React binding
- WeakMap prevents memory leaks
- Supports nested menus with `stopPropagation`
- Dynamic menu items via function

### Issues

#### 1. Hardcoded portal selector

```typescript
const ctxPortalRoot = document.querySelector(".ant-app");
```

**Fix:** Make configurable via props or context.

#### 2. Fixed element size estimate

```typescript
const { x, y } = computePosition({
	anchorX: event.clientX,
	anchorY: event.clientY,
	elementWidth: 100, // Hardcoded
	elementHeight: 100 // Hardcoded
	// ...
});
```

**Fix:** Measure actual element size after render, or use a ref.

---

## 5. `utils`

**Purpose:** General utility functions.

### Contents

- `computePosition` — Position element within viewport
- `DOM.ts` — DOM utilities
- `object.ts` — Object utilities
- `string.ts` — String utilities

### Strengths

- Well-documented `computePosition` with JSDoc
- Has tests

### Issues

#### 1. Typo in filename

```
computePostion.ts  // Should be computePosition.ts
```

**Fix:** Rename file.

---

## 6. `tiptap-file-upload-plugin`

**Purpose:** TipTap extension for file uploads via drag/drop/paste.

### Strengths

- Handles drag, drop, and paste
- Validates file type and size
- Extensible upload function per file type

### Issues

#### 1. No error handling in drop/paste handlers

```typescript
uploadFiles(files, insertPos, view, this.options.uploadFn).then(tr => view.dispatch(tr)); // No .catch()
```

**Fix:** Add error handling:

```typescript
uploadFiles(files, insertPos, view, this.options.uploadFn)
	.then(tr => view.dispatch(tr))
	.catch(error => console.error("File upload failed:", error));
```

#### 2. Commented out default upload functions

```typescript
addOptions() {
    return {
        uploadFn: {
            // "image/*": defaultImageUploadFn,
            // "!image/*": defaultFileUploadFn
        },
        // ...
    };
}
```

**Fix:** Either implement or remove.

---

## 7. `ant-config`

**Purpose:** Ant Design theme configuration for dark/light modes.

### Structure

```
src/lib/
├── darkThemeConfig.ts   # Dark theme
├── lightThemeConfig.ts  # Light theme
├── extraToken.ts        # Custom design tokens
└── types.ts             # Token type definitions
```

### Strengths

- Custom design tokens for app-specific styling
- Clean separation of themes
- Type-safe token definitions

### Issues

#### 1. Hardcoded color values

```typescript
export default {
	components: {
		Layout: {
			triggerBg: "#080808",
			headerBg: "#040404",
			siderBg: "#040404"
		}
	}
} as Omit<ThemeConfig, "algorithm">;
```

**Fix:** Consider using CSS variables or a color palette constant for consistency.

---

## 8. `ant-validation`

**Purpose:** Ant Design form validation rule factories.

### Contents

- `required` — Required field rule
- `email` — Email format validation
- `min/max/range` — Length/value constraints
- `password` — Password strength rules
- `confirmPassword` — Password match validation
- `composeRules` — Combine multiple rules

### Strengths

- Clean functional API
- Reusable across forms
- Consistent error messages

### Issues

#### 1. Hardcoded password length

```typescript
export const password: MakeRuleFunc = () => [
	...range({ min: 8, max: 16, type: "string" })
	// ...
];
```

**Fix:** Make configurable:

```typescript
export const password: MakeRuleFunc<{ minLength?: number; maxLength?: number }> = ({
	minLength = 8,
	maxLength = 16
} = {}) => [
	...range({ min: minLength, max: maxLength, type: "string" })
	// ...
];
```

#### 2. `confirmPassword` hardcoded to "password" field

```typescript
({ getFieldValue }) => ({
	validator: (_, value) => {
		if (!value || getFieldValue("password") === value) {
			// ...
		}
	}
});
```

**Fix:** Make field name configurable:

```typescript
export const confirmPassword: MakeRuleFunc<{ fieldName?: string }> = ({
	fieldName = "password"
} = {}) => [
	// ...
	getFieldValue(fieldName) === value
];
```

---

## 9. `tiptap-plugin-file-renderer`

**Purpose:** TipTap node extension for rendering files (images, videos, downloads).

### Structure

```
src/
├── plugin.ts     # TipTap Node extension
└── renderers.ts  # Default renderers for different file types
```

### Strengths

- Flexible renderer mapping by MIME type or extension
- Supports images, videos, audio, and generic files
- Input rule for markdown-style file syntax

### Issues

#### 1. Potential crash on missing src

```typescript
const ext = "." + props.node.attrs["src"].split(".").pop();
```

If `src` is null/undefined, this crashes.

**Fix:** Add null check:

```typescript
const src = props.node.attrs["src"];
const ext = src ? "." + src.split(".").pop() : "";
```

#### 2. Duplicate renderer lookup logic

Same logic in `renderHTML` and `addNodeView`:

```typescript
const rendererConfig =
	Object.entries(this.options.rendererMap).find(
		([key]) => (key && mime && minimatch(mime, key)) || (ext && key.includes(ext))
	)?.[1] || {};
```

**Fix:** Extract to helper function.

---

## 10. `video-player`

**Purpose:** Custom video player component with keyboard controls.

### Features

- Play/pause on click
- Fullscreen toggle (F key)
- Seek with arrow keys (±5s)
- Space to play/pause
- Progress slider
- Loading spinner

### Strengths

- Good keyboard accessibility
- Cross-browser fullscreen support
- Clean hook-based architecture

### Issues

#### 1. Missing dependency in `handleKeyDown`

```typescript
const handleKeyDown: React.KeyboardEventHandler<HTMLVideoElement> = useCallback(e => {
	// uses handleFullscreen
}, []); // Missing handleFullscreen dependency
```

**Fix:** Add `handleFullscreen` to dependency array.

#### 2. Vendor-prefixed fullscreen methods

```typescript
interface ExtendedDivElement extends HTMLDivElement {
	webkitRequestFullscreen?: HTMLDivElement["requestFullscreen"];
	mozRequestFullScreen?: HTMLDivElement["requestFullscreen"];
	msRequestFullscreen?: HTMLDivElement["requestFullscreen"];
}
```

These are legacy. Modern browsers support standard `requestFullscreen`.

**Fix:** Consider using a library like `screenfull` or simplify if legacy support isn't needed.

#### 3. Tightly coupled to TipTap

```typescript
import { NodeViewWrapper } from "@tiptap/react";
// ...
return (
    <NodeViewWrapper className={styles.wrapper} ...>
```

**Fix:** Make wrapper component configurable for reuse outside TipTap.

---

## Summary

| Priority  | Issue                              | Library              | Action                           |
| --------- | ---------------------------------- | -------------------- | -------------------------------- |
| 🔴 High   | Hardcoded API base URL             | api                  | Use env variable                 |
| 🟡 Medium | Chat component too large           | chat                 | Refactor into smaller components |
| 🟡 Medium | Global store without cleanup       | chat                 | Reset on unmount                 |
| 🟡 Medium | Dead auth endpoints                | api                  | Remove                           |
| 🟡 Medium | No error handling in file upload   | tiptap-file-upload   | Add .catch()                     |
| 🟡 Medium | Potential crash on null src        | tiptap-file-renderer | Add null check                   |
| 🟡 Medium | Missing useCallback dependency     | video-player         | Add handleFullscreen             |
| 🟢 Low    | Hardcoded portal selector          | context-menu         | Make configurable                |
| 🟢 Low    | Fixed element size in context menu | context-menu         | Measure actual size              |
| 🟢 Low    | Typo in filename (computePostion)  | utils                | Rename                           |
| 🟢 Low    | ApiError type mismatch             | api                  | Align with backend               |
| 🟢 Low    | pathParams naming confusion        | api                  | Rename to queryParams            |
| 🟢 Low    | Hardcoded password length          | ant-validation       | Make configurable                |
| 🟢 Low    | confirmPassword hardcoded field    | ant-validation       | Make configurable                |
| 🟢 Low    | Duplicate renderer lookup          | tiptap-file-renderer | Extract helper                   |
| 🟢 Low    | Video player coupled to TipTap     | video-player         | Make wrapper configurable        |
