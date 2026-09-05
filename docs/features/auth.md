# Auth

## Purpose

Google sign-in gates the app. Unauthenticated visitors can only reach `/login`; everything under the `_auth` layout requires a Firebase user.

## Files

| Path | Role |
| --- | --- |
| `src/config/firebase.ts` | Initializes the Firebase app and exports `auth`, `db`, `googleProvider`, `storage` |
| `src/services/auth.service.ts` | `signInWithGoogle`, `signOut`, `getCurrentUser`, `waitForUser` |
| `src/stores/auth.store.ts` | `authQueryOptions` (key `['auth','user']`) and `useAuthStore().invalidateAuth()` |
| `src/hooks/useAuth.ts` | Second, independent auth hook: `{ user, loading, login, logout }` via `onAuthStateChanged` |
| `src/routes/_auth.tsx` | The guard — loader + `MainLayout` wrapper |
| `src/routes/login.tsx` | `/login` route; bounces signed-in users to `/vehicles` |
| `src/routes/index.tsx` | `/` — redirects by auth state |
| `src/features/auth/login.page.tsx` | Login screen: `Sparkles` background + Google button |
| `src/features/auth/components/google-login-button/` | The button, styled with Google's official `gsi-material-button` CSS |

## How it works

**Sign-in.** `GoogleLoginButton` calls `authService.signInWithGoogle()` (a `signInWithPopup`), then `invalidateAuth()` to drop the cached `['auth','user']` entry, then navigates to `/vehicles`. On failure it toasts `"Login failed"`.

**The guard.** `src/routes/_auth.tsx` is a pathless layout route. Its loader awaits `queryClient.ensureQueryData(authQueryOptions)`; `authQueryOptions.queryFn` is `authService.waitForUser`, which wraps `onAuthStateChanged` in a promise that resolves on the **first** callback and immediately unsubscribes — this is what makes the guard wait for Firebase to restore a session instead of bouncing on a page refresh. If the resolved user is `null` it throws `redirect({ to: "/login" })`. `staleTime: Infinity` means the check runs once per session unless invalidated.

**Sign-out.** The sidebar's "Logout" entry calls `logout` from `useAuth`, which is `signOut(auth)` followed by `navigate({ to: "/login" })`.

**Entry redirects.** Both `/` and `/login` await `authService.waitForUser()` before deciding. Reading `auth.currentUser` synchronously is wrong here: on a hard refresh Firebase has not restored the session yet, so it always returns `null` and a signed-in user gets bounced through the login screen.

## Data touched

- Firebase Auth only — no Firestore reads or writes.
- Query key `['auth','user']`, holding `User | null`.
- The signed-in user's `displayName` is shown at the bottom of the sidebar (`src/features/layout-sidebar/sidebar.tsx`), falling back to `"Guest"`.

## Extending it

- **Another provider** (email, GitHub): add it to `src/config/firebase.ts` next to `googleProvider`, add a method to `authService`, and add a button beside `GoogleLoginButton` in `login.page.tsx`.
- **Reading the current user in a component**: prefer `useQuery(authQueryOptions)` over `useAuth`, so you share the guard's cache rather than opening another `onAuthStateChanged` subscription.
- **A new protected page**: put the route file under `src/routes/_auth/` and it inherits the guard automatically — no per-route auth code.

## Known gaps

- **Auth does not scope data — deliberately.** Nothing in the Firestore layer filters by user, so any signed-in account works on the same shared family fleet (see [vehicles.md](vehicles.md)). Sign-in is about keeping the app off the open internet, not about separating people's data.
- **Two parallel auth mechanisms.** `hooks/useAuth.ts` keeps its own `onAuthStateChanged` subscription and local state, while `services/auth.service.ts` + `stores/auth.store.ts` back the route guard. `useAuth` is used by the sidebar (`sidebar.tsx`, `useSidebarLinks.data.tsx`); the query path is used by the guard and the login button. They can briefly disagree, and `useAuth`'s `login` navigates to `/dashboard` while the login button navigates to `/vehicles`.
- `authService.signInWithGoogle` and `signOut` `console.error` and rethrow; callers are responsible for user-facing messaging, and `useAuth`'s versions swallow the error entirely.
