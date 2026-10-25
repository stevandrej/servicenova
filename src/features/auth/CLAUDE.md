# Feature: auth

Google sign-in screen. See the root `CLAUDE.md` for app-wide conventions.

## Files

- `login.page.tsx`: `LoginPage`, which shows the app title over the shared `Sparkles` particle background (`src/components/sparkles/`) with the login button.
- `components/google-login-button/google-login.button.tsx`: `GoogleLoginButton`.
- `components/google-login-button/google-login.button.style.css`: Google's official GSI "material button" markup/styles. Keep it as-is to comply with Google branding guidelines.

## Flow

1. Route `/login` (`src/routes/login.tsx`) `beforeLoad` waits for the first `onAuthStateChanged` and redirects to `/vehicles` if a user is already signed in.
2. Button click → `authService.signInWithGoogle()` (popup) → `useAuthStore().invalidateAuth()` so the `['auth', 'user']` query refetches → navigate to `/vehicles`.
3. Failure → `toast.error("Login failed")`.

## Related code outside this folder

- `src/services/auth.service.ts`: `signInWithGoogle`, `signOut`, `waitForUser`.
- `src/stores/auth.store.ts`: `authQueryOptions` (`staleTime: Infinity`), used by the `/_auth` route guard.
- `src/hooks/useAuth.ts`: separate hook-based auth state used by the sidebar (user name + logout). Its `login` navigates to `/dashboard`, unlike the button. If you change login/logout, keep both paths consistent.
