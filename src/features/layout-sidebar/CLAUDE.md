# Feature: layout-sidebar

App navigation sidebar (Aceternity UI–style, animated with framer-motion). It's rendered by `src/layouts/main.layout.tsx` for every `/_auth` route. See the root `CLAUDE.md` for app-wide conventions.

## Files

- `sidebar.tsx`: `Sidebar`, the entry point. It renders nav links plus the signed-in user's display name at the bottom (from `useAuth`).
- `useSidebarLinks.data.tsx`: the nav items (Dashboard, Vehicles, Logout). **Add new pages here.** Logout is a link with `href: "#"` and `action: logout`.
- `sidebar-link.tsx` / `sidebar-link.type.ts`: `SidebarLink` (TanStack `Link` + animated label), `Links` type. It closes the mobile menu on click when the viewport is under 768px, then runs `link.action`.
- `sidebar.provider.tsx` + `useSidebar.ts`: context with `{ open, setOpen, animate }`. It can be controlled (props from `MainLayout`) or uncontrolled.
- `sidebar-body.tsx`: renders both `DesktopSidebar` and `MobileSidebar`. CSS breakpoints decide which one shows.
- `desktop-sidebar.tsx`: fixed, expands on hover from 60px to 250px (`md:` and up).
- `mobile-sidebar.tsx`: top bar with a burger icon that opens a full-screen slide-in overlay (below `md`).

## Gotchas

- `MainLayout`'s content area uses `md:ml-[60px]` to match the collapsed desktop width. If you change the collapsed width, update both places.
- Colors use the NextUI `primary-900` background with `neutral-200` icons and text.
- `sidebar.tsx` (like `Timeline` and `Sparkles`) has a leftover `"use client"` directive from the copied component. It has no effect in Vite.
