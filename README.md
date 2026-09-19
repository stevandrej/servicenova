# Service Nova

A progressive web app for tracking car service history and knowing when the next service is due.

Add the vehicles you own, log every service with its date, mileage, cost and notes, set the date the car is next due, and get it into your calendar. The vehicle list colors each car by how soon it needs attention, and the dashboard summarizes the whole fleet: total spend, upcoming services, cars that look neglected, and what maintenance has cost month by month.

## Stack

React 19 + TypeScript + Vite · TanStack Router & Query · Firebase (Google auth + Firestore) · NextUI + Tailwind + framer-motion · installable PWA via `vite-plugin-pwa`.

## Getting started

Requires Node 18+ and [pnpm](https://pnpm.io/).

```bash
pnpm install
cp .env.example .env    # then fill in your Firebase project values
pnpm dev
```

You need a Firebase project with **Google sign-in** enabled and **Cloud Firestore** provisioned. All eight `VITE_FIREBASE_*` values come from the Firebase console (Project settings → Your apps → Web app config).

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm typecheck` | Typecheck only (fast, incremental) |
| `pnpm build` | Typecheck and build for production |
| `pnpm preview` | Serve the production build (needed to test the service worker) |
| `pnpm lint` | Run ESLint |
| `pnpm generate-pwa-assets` | Regenerate app icons from `logo.jpg` |

## Data

Firestore holds one `vehicles` collection; each vehicle document has a `services` subcollection and a denormalized `nextServiceDate`.

> **Note:** this is a *shared* garage by design — every signed-in account reads and writes the same fleet, which is what you want for family cars. Firestore security rules live in the Firebase console, not in this repository.

## Documentation

Written for both people and coding agents:

- [`AGENTS.md`](AGENTS.md) — commands, conventions, pinned library-doc URLs, and where things live. Read by Claude Code, Codex, Cursor and Copilot; `CLAUDE.md` is a one-line pointer to it.
- [`docs/architecture.md`](docs/architecture.md) — data flow, Firestore model, routing
- [`docs/features/`](docs/features/) — one document per feature: [auth](docs/features/auth.md), [vehicles](docs/features/vehicles.md), [service history](docs/features/service-history.md), [reminders & calendar](docs/features/reminders-calendar.md), [dashboard](docs/features/dashboard.md), [layout & navigation](docs/features/layout-navigation.md), [PWA & offline](docs/features/pwa-offline.md)
