# Service Nova

Personal PWA for tracking vehicle services: when a service was done, what was changed/repaired, mileage, cost, notes, and when the next service is due. Shows a dashboard (totals, vehicles needing attention, monthly spending), a per-vehicle service timeline, and "add to calendar" reminders.

Single user, Google login. Units: **km** for mileage, **MKD** for prices, dates formatted with the **en-GB** locale.

## Commands

- `pnpm dev` — Vite dev server
- `pnpm build` — `tsc -b && vite build` (type errors fail the build)
- `pnpm lint` — ESLint
- `pnpm generate-pwa-assets` — regenerate PWA icons from `pwa-assets.config.ts`

There is no test suite. Verify changes with `pnpm build` + `pnpm lint`, and by running the app.

## Stack

- React 18 + TypeScript (strict, `noUnusedLocals`/`noUnusedParameters` on)
- Vite 5, `@vitejs/plugin-react`, TanStack Router Vite plugin (file-based routing)
- TanStack Router + TanStack React Query v5
- NextUI v2 + Tailwind 3 — merge classes with `cn()` from `src/lib/utils.ts`
- Firebase: Auth (Google popup) + Firestore. Storage is initialised but unused.
- framer-motion, react-toastify (all user feedback), `@tabler/icons-react`
- vite-plugin-pwa with `registerType: 'prompt'` — updates surface via `src/components/ReloadPrompt.tsx`

## Layout

```
src/
  routes/        thin TanStack route files (loaders, guards) → render features
  features/      UI grouped by feature — each folder has its own CLAUDE.md
  services/      Firestore access: vehiclesQueryOptions + one hook per mutation
  types/         TVehicle, TVehicleWithServices, TService
  utils/         formatDate.ts (display formatting + Timestamp <-> Date)
  components/    shared UI: Timeline, AddToCalendar, Sparkles, ReloadPrompt
  layouts/       MainLayout (sidebar + content area)
  stores/        authQueryOptions / useAuthStore (React Query based)
  config/        firebase.ts (reads VITE_FIREBASE_* env vars)
```

## Routing

- `src/routeTree.gen.ts` is **generated** by the router plugin — never edit it.
- `/` → redirects to `/vehicles` or `/login`.
- `/login` → `beforeLoad` waits for Firebase auth state, redirects to `/vehicles` if signed in.
- `/_auth` → pathless layout + guard: loader `ensureQueryData(authQueryOptions)`, redirects to `/login` when no user; wraps children in `MainLayout`.
- `/_auth/dashboard`, `/_auth/vehicles`, `/_auth/vehicles_/$vehicleId` (trailing `_` = not nested under `/vehicles` layout; URL is `/vehicles/:id`).
- Router context carries `queryClient`; `defaultPreload: "intent"`.

## Data model (Firestore)

- `vehicles/{vehicleId}` — `make, model, year, plate, imageUrl?, nextServiceDate: Timestamp | null`
- `vehicles/{vehicleId}/services/{serviceId}` — `date: Timestamp, mileage, price, serviceType, notes` (the add/update payloads also write `nextServiceDate` onto the service doc, but it isn't read back)

The vehicle's `nextServiceDate` is the source of truth for "next service due" across the app.

## Data-flow conventions

- **One query key: `["vehicles"]`** (`vehiclesQueryOptions` in `src/services/useFetchVehicles.ts`). It fetches all vehicles, then each vehicle's `services` subcollection (N+1), converts Timestamps to `Date`, and sorts services newest-first. Every screen reads from this cache.
- **UI only deals with `Date`.** Convert at the service boundary with `dateToFirebaseTimestamp` / `firebaseTimestampToDate` from `src/utils/formatDate.ts`. Display with `formatDate` (`dd-mm-yyyy`) or `formatDateToLongDate`.
- **Mutations** live in `src/services/useXxx.ts` as `useMutation` hooks. Each one toasts success/error via react-toastify, then either patches the cache with `setQueryData(["vehicles"], …)` or calls `refetchQueries`. Follow the same pattern for new mutations.
- **Forms** are uncontrolled (`useRef` per input) with a `mode: "add" | "edit"` prop, rendered inside NextUI `Modal`s opened via `useDisclosure`.
- **Form modals must fit when the mobile keyboard is open.** Use `scrollBehavior="inside"` plus the reduced mobile `max-h` on `classNames.base`, and give the `<form>` that wraps `ModalHeader/Body/Footer` `className="flex flex-col min-h-0"`. Without that class the body can't scroll. See `service-form-modal.tsx`.
- **Mobile zoom:** `src/main.css` forces 16px text on form fields for touch devices, which stops iOS zooming in on focus. Don't override field font sizes below that.
- Destructive actions confirm with `window.confirm()`.

## Code conventions

- Use relative imports. The `@` alias is defined in `vite.config.ts` but not in tsconfig `paths`, so it won't type-check.
- Named exports for components (dashboard sub-components are the exception — default exports).
- Types are prefixed with `T` (`TVehicle`, `TService`).
- File names are kebab-case, plus suffixes like `.page.tsx`, `.form.tsx`, `.provider.tsx`, `.type.ts`.
- Styling: Tailwind utilities + NextUI components; `font-outfit` is the custom display font.

## Known quirks

Know these before touching the related code. Don't "fix" them unless the task asks for it.

- `vehicles` isn't scoped per user (no `userId` field or query filter). The app assumes a single owner and relies on Firestore security rules.
- Deleting a vehicle doesn't delete its `services` subcollection (orphaned docs).
- `useAddService` always overwrites the vehicle's `nextServiceDate`, including with `null` if the field was left empty. `useUpdateService` doesn't touch the vehicle doc at all.
- There are two auth paths: the `useAuth` hook (`src/hooks/useAuth.ts`, used by the sidebar for user name + logout) and `authService` + `authQueryOptions` (route guard + login button).
- The service form converts dates via `toISOString().split("T")[0]` → `parseDate`, which can shift a day depending on timezone.
- `/vehicles` empty state references `/empty-garage.svg`, but there's no `public/` folder, so the image is missing.

## Environment

Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values. `.env` is gitignored, so never commit it.
