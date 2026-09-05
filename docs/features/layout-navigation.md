# Layout & navigation

## Purpose

The authenticated app shell: a collapsing sidebar on desktop, a slide-over drawer on mobile, and the scrollable content area every protected page renders into.

## Files

| Path | Role |
| --- | --- |
| `src/routes/_auth.tsx` | Wraps all protected routes in `MainLayout` |
| `src/layouts/main.layout.tsx` | Shell: sidebar + content area + offline chip |
| `src/features/layout-sidebar/sidebar.tsx` | Composes provider, links, and the user row |
| `src/features/layout-sidebar/sidebar.provider.tsx` | Context provider; supports controlled or internal `open` state |
| `src/features/layout-sidebar/useSidebar.ts` | `SidebarContext` and `useSidebar()` (throws outside a provider) |
| `src/features/layout-sidebar/sidebar-body.tsx` | Renders both variants; CSS decides which is visible |
| `src/features/layout-sidebar/desktop-sidebar.tsx` | `md:` and up — hover-expand rail with a pin toggle |
| `src/features/layout-sidebar/mobile-sidebar.tsx` | Below `md:` — hamburger bar and full-screen drawer |
| `src/features/layout-sidebar/sidebar-link.tsx` | A link *or* button row; animates its label |
| `src/features/layout-sidebar/useSidebarLinks.data.tsx` | **The nav definition** |
| `src/features/layout-sidebar/sidebar-link.type.ts` | The `Links` type |
| `src/components/sparkles/` | Particle background, used only on the login screen |
| `src/components/not-found.tsx` | The router's `notFoundComponent` |

## How it works

`MainLayout` owns the `open` state and passes it to `Sidebar` along with `animate`, so both sidebar variants share one source of truth. The content area is `md:ml-[60px]` — matching the collapsed rail width — and `overflow-auto`, so pages scroll independently of the shell.

**Desktop.** `DesktopSidebar` is `fixed`, `hidden md:flex`, and animates its width between `60px` and `250px` on mouse enter and leave. It never pushes content; the layout's fixed left margin reserves the collapsed width.

A pin button in the top corner toggles `pinned` in the sidebar context, persisted to `localStorage` under `serviceNova:sidebarPinned` (reads and writes are wrapped in `try`/`catch` — private mode throws). While pinned the rail stays expanded and the mouse handlers are skipped, so it no longer opens and closes every time the pointer crosses the left edge. Pinning is desktop-only: the button lives inside the `hidden md:flex` rail.

**Mobile.** `MobileSidebar` renders a slim bar with an `IconMenu2` toggle; when open, an `AnimatePresence` panel slides in from the left at `z-[100]` covering the screen, with an `IconX` to close. Both are real `<button>`s with `aria-label`s — as bare SVGs with `onClick` they could not be reached or activated from the keyboard.

**Links.** `useSidebarLinks()` returns the nav array — Dashboard (`/dashboard`), Vehicles (`/vehicles`), and Logout (no `href`, just an `action` that calls `logout` from `useAuth`).

`SidebarLink` branches on `href`: an entry with one renders a TanStack `Link` carrying `activeProps` so the current route is highlighted; an entry without one renders a `<button>`. That split matters — Logout used to be a `<Link to="#">`, so it navigated as well as logging out and was not a real control for keyboard or screen-reader users. Both variants auto-close the drawer when `window.innerWidth < 768`. The label is a `motion.span` that fades and toggles `display` with the open state, so collapsed mode shows icons only.

The signed-in user's `displayName` (or `"Guest"`) sits at the bottom as an action-less entry, which renders as a disabled button.

## Data touched

None — Firebase Auth only, for the display name and logout.

## Extending it

- **A nav entry**: add an object to `useSidebarLinks.data.tsx` with `label`, `href` (omit it for an action-only row, which renders as a button), `icon` (a `@tabler/icons-react` icon with `className="text-neutral-200 h-5 w-5 flex-shrink-0"` to match the others), and optionally `action` for behavior instead of navigation. Nothing else needs touching.
- **A new protected page**: add the route file under `src/routes/_auth/` — the shell and the auth guard come for free.
- **Theming**: the sidebar is `bg-primary-900` from the NextUI theme; `tailwind.config.js` registers the NextUI plugin and the `Outfit` font family (`font-outfit`, used on vehicle cards).

## Known gaps

- `darkMode: "class"` is set in `tailwind.config.js`, but nothing ever adds the class and **no component carries a `dark:` variant any more** — the last of them went with `Timeline.tsx`. The toast container is still hardcoded to `theme="dark"`. Dark mode is now a clean slate rather than a half-built feature: adding it means a deliberate palette pass, not just a toggle.
- `sidebar.tsx` and `sidebar-link.tsx` are marked `"use client"`, a Next.js directive with no meaning in this Vite app — a leftover from where the component was copied from.
- The pinned state is per-browser `localStorage`, so it does not follow the user across devices.
