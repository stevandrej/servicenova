# PWA & offline

## Purpose

Service Nova is installable. `vite-plugin-pwa` generates a Workbox service worker and a web app manifest at build time, and the app prompts the user when a new version is available.

## Files

| Path | Role |
| --- | --- |
| `vite.config.ts` | `VitePWA({...})` — manifest and Workbox options |
| `src/components/ReloadPrompt.tsx` | Registers the service worker and shows the update toast |
| `src/routes/__root.tsx` | Mounts `ReloadPrompt`, so the worker registers before sign-in |
| `src/config/firebase.ts` | `initializeFirestore` with the IndexedDB persistent cache |
| `src/services/settleLocally.ts` | Resolves a write once it is in the local cache, not on the server ack |
| `src/hooks/useOnlineStatus.ts` | Tracks connectivity for the offline chip in `MainLayout` |
| `pwa-assets.config.ts` | Icon generation preset and source image |
| `index.html` | Title, description, theme color, icon links |
| `src/vite-env.d.ts` | `vite-plugin-pwa/client` and `/react` type references (`src/env.d.ts` types the `VITE_FIREBASE_*` vars) |
| `public/pwa-*.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico` | Generated icons. They live in `public/` so Vite copies them into the build |

## How it works

**Manifest** (in `vite.config.ts`): name and short name "Service Nova", description "Vehicle Service Management App", `theme_color` and `background_color` `#ffffff`, `display: standalone`, `orientation: portrait`, `start_url: /`, and 192/512 icons plus a dedicated 512 `maskable` entry.

**Workbox**: `cleanupOutdatedCaches`, `clientsClaim`, and `skipWaiting` are all on, so an activated worker takes over immediately. Precaching uses the plugin's defaults over the build output, with `favicon.ico`, `apple-touch-icon-180x180.png`, and `logo.jpg` added via `includeAssets`. `navigateFallback: 'index.html'` serves the app shell for any navigation, so a cold offline launch on a deep route still renders the app.

Two `runtimeCaching` rules back it up, both `CacheFirst` with a 30-day expiry and `cacheableResponse: { statuses: [0, 200] }` so opaque cross-origin responses are kept:

- any request whose `destination` is `image` (vehicle photos are arbitrary remote URLs typed into the vehicle form, so there is no host to match on), capped at 60 entries;
- `lh3.googleusercontent.com`, the Google account avatar in the sidebar, capped at 10.

**Firestore offline persistence**: `src/config/firebase.ts` builds `db` with `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. Reads are served from IndexedDB when the network is gone and writes are queued and replayed on reconnect. The multi-tab manager is the modern replacement for the deprecated `enableIndexedDbPersistence`, which only one tab could hold at a time.

**Writes offline**: Firestore commits a write to its local cache synchronously, but the promise returned by `setDoc` / `updateDoc` / `deleteDoc` / `batch.commit()` only settles on the *server* ack, which never arrives offline. Awaiting one there hangs the mutation forever — no toast, no cache patch, modal stuck spinning. Every hook in `src/services/` therefore routes its write through `settleLocally(value, ack)`, which resolves immediately and reports a genuine server rejection as a late error toast. Two knock-on effects: `useAddVehicle` and `useAddService` mint the document id client-side with `doc(collection(db, path))` instead of taking it from `addDoc`, and each hook's `onError` now only covers synchronous failures.

`src/lib/react-query.ts` sets `networkMode: 'offlineFirst'` on queries and mutations. The TanStack Query default (`'online'`) pauses everything while `navigator.onLine` is false, which would defeat the persistent cache.

**Telling the user**: `useOnlineStatus` drives a fixed `Chip` in `MainLayout` ("Offline — changes will sync"), and `savedToast` in `settleLocally.ts` appends "will sync when you're back online" to every success toast raised while offline.

**Update flow**: `registerType: 'prompt'` means a new worker waits rather than reloading behind the user's back. `ReloadPrompt` calls `useRegisterSW` and watches `needRefresh`; when it flips true it fires a persistent react-toastify toast ("New content available…") containing a **Reload** button wired to `updateServiceWorker(true)`. The component renders `null` — it is behavior only. It is mounted in `__root.tsx` rather than `MainLayout`, because the worker has to register before sign-in or the precache never warms for someone who lands on `/login` first.

**Icons**: `pnpm generate-pwa-assets` runs `@vite-pwa/assets-generator` against `pwa-assets.config.ts` and rewrites the icons in `public/`. The preset is inline: transparent 64/192/512 (with a 64px `favicon.ico`), maskable 512, and apple 180 — all rendered from `logo.jpg`.

## Data touched

None. Caching is Workbox precaching of build assets.

## Extending it

- **More runtime caching**: add entries to the `workbox.runtimeCaching` array in `vite.config.ts`.
- **New icons**: replace `public/logo.jpg` and re-run `pnpm generate-pwa-assets`.
- **Auto-update instead of prompting**: change `registerType` to `'autoUpdate'` and delete `ReloadPrompt` — but note `skipWaiting` is already on, so an unsaved form could be interrupted by a reload.

## Verifying changes

The service worker is not active in `pnpm dev`. Use `pnpm build && pnpm preview`, then check Application → Service Workers in DevTools. To exercise the update prompt: load the preview, rebuild, and reload once — the toast should appear.

## Known gaps

- The manifest still has no `screenshots`, which some browsers use to enrich the install prompt.
- `ReloadPrompt` logs registration events to the console.
- A signed-out cold start offline reaches `/login` and cannot authenticate, since Google sign-in needs the network. Offline only works for a session that has signed in at least once.
- The production bundle is a single ~1.6 MB chunk (Vite warns about it); nothing is code-split.
- A queued offline write is replayed by Firestore, but nothing in the UI reports when the queue has drained — the offline chip only tracks `navigator.onLine`.
