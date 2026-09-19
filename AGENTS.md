# Service Nova

Service Nova (npm package name `car-services`) is a React + TypeScript + Vite PWA for tracking a personal car fleet: the vehicles you own, every service they have had, and when the next service is due. Data lives in Firebase — Google sign-in for auth, Firestore for storage. Routing is TanStack Router file routes, server state is TanStack Query, UI is NextUI + Tailwind + framer-motion, and toasts come from react-toastify.

## Commands

The repo uses **pnpm** (`pnpm-lock.yaml`, `.npmrc`).

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server with HMR. Browser console errors and unhandled rejections are forwarded to this terminal by `vite/browser-to-terminal.ts` — read them there rather than asking for a screenshot. |
| `pnpm typecheck` | `tsc -b` on its own. Incremental, ~1.5s. **This is the fast inner loop — use it, not `pnpm build`.** |
| `pnpm lint` | ESLint over the repo, `--max-warnings 0` (`pnpm lint:watch` for watch mode) |
| `pnpm build` | `tsc -b && vite build` — full production build, only needed before shipping |
| `pnpm preview` | Serve the production build (needed to exercise the service worker) |
| `pnpm test` | Vitest over `src/**/*.test.ts` (`pnpm test:watch` for watch mode). Fast — no DOM, no setup file. |
| `pnpm generate-pwa-assets` | Regenerate PWA icons from `pwa-assets.config.ts` |

Verification is `pnpm typecheck`, `pnpm lint`, `pnpm test`, and running the app. All are clean; keep them that way.

**Tests cover the pure logic only** — the date and currency formatters, the service-due thresholds, the service-type matching, and the export formatters. There is no component or DOM testing, so anything involving NextUI, Firestore or the router still has to be checked in the browser. When you touch a pure function in `src/utils/`, extend its test file rather than leaving it uncovered; that is the cheapest safety net this app has.

Neither typecheck nor lint catches what actually breaks in this app: writes that hang offline, a stale service worker, a cached image that returns an opaque response. Those need `pnpm dev` (or `pnpm preview` for anything service-worker related) and the browser. See "Seeing runtime behaviour" below.

## Library docs — use these exact URLs

Several dependencies are pinned to a major version whose docs are **no longer
what you get by searching for the library's name**. Read the version-matched
docs below before writing code against these libraries; a plausible-looking API
from the newer docs will typecheck against nothing and fail at runtime.

| Library | Installed | Read | Do **not** read |
| --- | --- | --- | --- |
| NextUI | `@nextui-org/react` 2.x | <https://v2.heroui.com/docs/guide/introduction> | `nextui.org` and `heroui.com` — both now serve **HeroUI v3**, a different library built on Tailwind 4 and React Aria. `nextui.org` redirects straight to the v3 migration guide. |
| Tailwind | 3.4.x | <https://v3.tailwindcss.com/docs> | `tailwindcss.com` — that is **Tailwind 4**, which has a different config format and no `tailwind.config.js`. |
| TanStack Router | 1.x | <https://tanstack.com/router/latest/llms.txt> | |
| TanStack Query | 5.x | <https://tanstack.com/query/latest/llms.txt> | |
| React | 19.x | <https://react.dev/llms.txt> | |
| Vite | 8.x | <https://vite.dev/llms.txt> | |
| Firebase Web SDK | 12.x | <https://firebase.google.com/docs/firestore> (no `llms.txt`) | |

The `llms.txt` links are indexes in the [llms.txt convention](https://llmstxt.org/) — fetch the index, then the page you need.

None of these packages bundle their docs into `node_modules`, so unlike a
Next.js project there is no offline copy to fall back on.

## Seeing runtime behaviour

Vite has no equivalent of Next.js's `logging.browserToTerminal` or its MCP
server, so two things fill the gap:

- **`vite/browser-to-terminal.ts`** — a dev-only plugin that forwards browser
  `console.error` / `console.warn`, uncaught exceptions and unhandled promise
  rejections into the `pnpm dev` terminal. Runtime failures show up in the
  output you are already reading. It is `apply: "serve"`, so none of it reaches
  the production bundle.
- **`.mcp.json`** — wires up the Chrome DevTools MCP server, for when you need
  to drive the page: inspect the DOM, read the network log, or toggle offline
  mode. It runs via `npx` and needs approval on first use.

  It passes `--autoConnect`, so it attaches to the Chrome you already have
  open instead of launching its own. That matters because a freshly launched
  Chrome has a clean profile, and every screen worth looking at is behind the
  Google sign-in guard — an unauthenticated browser only ever shows you the
  login page. For it to connect, switch remote debugging on once in that Chrome
  window from `chrome://inspect/#remote-debugging` (Chrome 144+). If the
  server reports no browser, ask for that toggle rather than starting a second
  one.

To check anything service-worker related — the update prompt, offline caching,
the install flow — use `pnpm preview`, not `pnpm dev`. The service worker is not
active in dev.

## Setup

Copy `.env.example` to `.env` and fill in the eight Firebase values:

```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_DATABASE_URL,
VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID
```

They are read in one place: `src/config/firebase.ts`.

## Conventions

Follow what the existing code does:

- **Feature folders.** UI lives in `src/features/<feature>/`. Routes in `src/routes/` stay thin and delegate to a feature component.
- **One hook file per Firestore mutation** in `src/services/` (`useAddVehicle.ts`, `useDeleteService.ts`, …). Each exports a single `useMutation` wrapper and fires a success/error toast.
- **Never `await` a Firestore write directly in a mutation hook.** A write promise only settles on the server ack, which never arrives offline, so awaiting one hangs the mutation forever. Route it through `settleLocally(value, ack)` from `src/services/settleLocally.ts`, and use `savedToast` for the success toast. To create a document, mint the id with `doc(collection(db, path))` and `setDoc` rather than `addDoc`.
- **`["vehicles"]` is the app's source of truth.** `vehiclesQueryOptions` in `src/services/useFetchVehicles.ts` loads every vehicle *with* its services; the dashboard, the list, and the detail page all read from that one cache entry. Don't add a second read path for the same data.
- **Service-due thresholds** live only in `src/utils/serviceDue.ts` (`getServiceUrgency`, `getVehiclesDue`, `getVehiclesNeedingAttention`). Don't reintroduce inline day counts in components.
- **Service intervals** are `intervalMonths` on the presets in `src/utils/serviceTypes.tsx`, read through `suggestNextServiceDate` in `serviceDue.ts`. The service form uses it to pre-fill the next service date, but only until the user edits that field — a date they set themselves is never overwritten. Presets with no `intervalMonths` (bodywork, cleaning) suggest nothing.
- **Preset matching is word-anchored.** Every `match` regex starts with `\b`, because plain substring matching classified "en**tire**ly" as a tyre service and "sp**oil**ed" as an oil change. Keep the anchor when adding a preset.
- **Dates.** Convert at the Firestore boundary with `firebaseTimestampToDate` / `dateToFirebaseTimestamp`, and format with `formatDate` / `formatDateToLongDate` from `src/utils/formatDate.ts` (both `en-GB`). Don't call `toLocaleDateString` directly in components.
- **Class names.** Merge with `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).
- **Destructive actions** use `ConfirmDialog` from `src/components/confirm-dialog.tsx`, never the native `confirm()`, which blocks the tab and looks like a browser error in an installed PWA.
- **Money** is formatted with `formatCurrency` from `src/utils/formatCurrency.ts`. Don't write `toLocaleString()` plus a literal currency code in a component.
- **Forms are uncontrolled** — `useRef` + `defaultValue` on NextUI `Input`s. `useState` is for the components that require a controlled value: `DatePicker` and `Autocomplete`.
- **Don't blanket-bump dependencies.** A few are held back on purpose (Tailwind 3, tailwind-merge 2, `@internationalized/date` 3.6.0, TypeScript below 6.1). See "Dependencies held back on purpose" in [docs/architecture.md](docs/architecture.md) before running `pnpm update --latest`, and "Library docs" above for where the matching docs live.
- **Imports are relative.** A `@/` → `src/` alias exists in `vite.config.ts` but nothing uses it; match the surrounding files.
- **Never edit `src/routeTree.gen.ts`** — it is generated by `TanStackRouterVite()` from the files in `src/routes/`.

## Skills

`.claude/skills/` holds checklists for the workflows in this repo that have
non-obvious invariants, so they load when the task starts instead of being
prose you have to remember to apply:

| Skill | Use it when |
| --- | --- |
| `firestore-mutation-hook` | Adding or changing any Firestore write — a new hook in `src/services/`, or wiring a form to one |

## Documentation map

| Doc | Read it when you're working on |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Data flow, Firestore shape, routing and provider setup — read this first |
| [docs/features/auth.md](docs/features/auth.md) | Sign-in, sign-out, route protection |
| [docs/features/vehicles.md](docs/features/vehicles.md) | The vehicle list, vehicle cards, adding/editing/deleting a vehicle |
| [docs/features/service-history.md](docs/features/service-history.md) | Service records, the history timeline, per-vehicle metrics |
| [docs/features/reminders-calendar.md](docs/features/reminders-calendar.md) | `nextServiceDate`, urgency colors, calendar export |
| [docs/features/dashboard.md](docs/features/dashboard.md) | Fleet overview, "needs attention", monthly spending |
| [docs/features/layout-navigation.md](docs/features/layout-navigation.md) | App shell, sidebar, adding a nav entry |
| [docs/features/pwa-offline.md](docs/features/pwa-offline.md) | Service worker, manifest, update prompt, icons |

## Known gaps (fleet-wide)

These are real and intentional to document, not TODOs someone forgot to file. Per-feature detail is in each doc.

- The Firestore `vehicles` collection is **global by design — one shared family garage**. There is no `userId` field and no per-user filter: any signed-in account sees and edits the same fleet. This is intentional, not an oversight; don't "fix" it into per-user scoping without being asked.
- No `firestore.rules` or `firebase.json` in the repo, so security rules live outside version control, in the Firebase console. The deployed rules allow read and write on `vehicles/{vehicle}` and `vehicles/{vehicle}/services/{serviceId}` to any request with `request.auth != null`. Two consequences: service reads must stay per-vehicle (a `collectionGroup` query needs a `/{path=**}/services/{serviceId}` rule and would otherwise fail closed), and access is open to **any** Google account, not just family ones.
- Currency is a single hardcoded code, now in one place (`CURRENCY` in `src/utils/formatCurrency.ts`) rather than five components; mileage is assumed to be kilometers.
