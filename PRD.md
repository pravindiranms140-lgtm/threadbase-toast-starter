# Product Requirements Document (PRD)

## Project: Threadbase Toast Notification System

---

### 1. Document Control
- **Document Version:** 1.0.0
- **Status:** Approved / Ready for Verification
- **Target Audience:** Engineering, QA, Product Management, System Evaluators
- **Repository:** `threadbase-toast-starter`

---

### 2. Executive Summary
Threadbase is a developer and discussion platform where users perform asynchronous actions such as thread creation and account authentication. Currently, user interactions lack real-time, non-blocking visual feedback. 

This project delivers a **lightweight, custom toast notification system built in React without third-party libraries**. The notification system provides instantaneous, accessible, and ephemeral visual feedback for background operations, distinguishing between success, warning/info, and server-side errors.

---

### 3. Problem Statement & Business Objectives
#### Problem Statement
- **Silent Operations:** When users post a thread or submit authentication credentials, network mutations occur without immediate visual cues.
- **Intrusive Alternatives:** Native browser alerts (`window.alert`) block user interactions and break UX flow.
- **Third-Party Bloat:** Introducing heavy external toast libraries introduces unwanted bundle size, transitive security dependencies, and styling friction.

#### Objectives
1. **Provide Ephemeral Feedback:** Provide distinct visual notifications that auto-dismiss after a predetermined duration (default 3000ms).
2. **Support Multiple Severity Types:** Support `success` (green), `error` (red), and `info` (blue) toast variants.
3. **Non-Intrusive Stacking:** Display toasts fixed in the top-right corner, cleanly stacked without layout shifting.
4. **Accessible & Responsive:** Implement standard accessibility semantics (`role="status"`, keyboard/mouse dismissibility) with responsive behavior.
5. **Zero External Toast Dependencies:** Rely purely on native React Context, custom hooks, and CSS.

---

### 4. User Personas & Use Cases

#### 4.1 Personas
- **Forum Contributor (Alex):** Frequently posts threads and needs immediate reassurance that posts were published or actionable feedback if the title is duplicated.
- **Registered Member (Sam):** Logs into the platform and needs clear confirmation of login status or detailed error feedback upon authentication failure.
- **Frontend Engineer / Evaluator:** Requires a modular, maintainable, and decoupled notification API (`useToast`) that can be invoked anywhere in the component hierarchy.

#### 4.2 User Stories & Acceptance Criteria

| ID | User Story | Acceptance Criteria |
|---|---|---|
| **US-1** | As a user posting a new thread, I want immediate visual confirmation so I know it succeeded. | Submitting a valid thread displays a green success toast: `"Thread posted!"` which auto-dismisses after 3 seconds. |
| **US-2** | As a user entering an invalid/duplicate title, I want an error notification explaining the issue. | Submitting `"Welcome to Threadbase"` triggers an error toast: `"A thread with this title already exists"`. |
| **US-3** | As a user logging in, I want clear feedback on credential validity. | Successful login displays `"Welcome back!"` (green). Invalid credentials display `"Invalid username or password"` (red). |
| **US-4** | As a user, I want to dismiss a notification immediately if it blocks my view. | Clicking directly on any active toast removes it from the screen immediately. |
| **US-5** | As a user performing multiple actions quickly, I want to see all relevant messages. | Rapidly triggered toasts stack vertically in the top-right corner without overlapping. |

---

### 5. Functional Requirements (FR)

- **FR-1: Toast Context & Global Provider**
  - The application must provide a `ToastProvider` wrapping the application root.
  - Expose a `useToast()` hook returning `{ showToast, dismissToast }`.
  - Enforce provider boundaries: calling `useToast()` outside `ToastProvider` must throw a descriptive error.

- **FR-2: Toast Invocation (`showToast`)**
  - Signature: `showToast(message: string, type?: "info" | "success" | "error", duration?: number)`
  - Default parameters: `type = "info"`, `duration = 3000` milliseconds.
  - Generates a unique RFC-4122 compliant ID (`crypto.randomUUID()`) for each toast instance.
  - Automatically schedules dismissal after `duration` ms.

- **FR-3: Toast Dismissal (`dismissToast`)**
  - Signature: `dismissToast(id: string)`
  - Removes the target toast from the active state list using immutable filtering.
  - Stable callback reference via `useCallback` to prevent unnecessary re-renders.

- **FR-4: Presentation & Container (`ToastContainer`)**
  - Renders a fixed container at the top-right corner (`className="toast-container"`).
  - Iterates over active toasts and applies semantic CSS classes: `.toast`, `.toast-{type}`.
  - Implements click-to-dismiss behavior on each toast item.
  - Includes `role="status"` for assistive technology.

- **FR-5: Form & Mutation Integrations**
  - **Thread Creation Form:** Integrated with TanStack Query mutation for `createThread`. Triggers success toast on resolve and extracts `error.response?.data?.message` on reject.
  - **Login Form:** Integrated with TanStack Query mutation for `login`. Triggers success toast on valid credentials (`ada`/`password`) and error toast on invalid attempts.

---

### 6. Non-Functional Requirements (NFR)

- **Performance:** Render cycle efficiency; state updater callbacks (`setToasts(prev => ...)`) prevent stale closures; memoized handler functions avoid child re-renders.
- **Bundle Footprint:** 0 kB external toast library overhead; uses built-in React hooks and lightweight CSS keyframe animations.
- **Accessibility:** Toast container marked with `role="status"`, enabling screen readers to announce updates without aggressive interruptions (`aria-live="polite"` behavior).
- **Reliability:** Graceful error handling; fallback strings provided if `error.response.data.message` is undefined.

---

### 7. Constraints & Out-of-Scope Items
- **Constraints:** Must use React 18+ and TanStack Query v5. Must follow existing styles in `src/index.css`.
- **Out of Scope:**
  - Persisting notification history to LocalStorage or a remote database.
  - Action buttons inside toasts (e.g., "Undo", "Retry").
  - Sound effects / haptic feedback.
  - Custom swipe gestures for touch screens.

