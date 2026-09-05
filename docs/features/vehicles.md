# Vehicles

## Purpose

The fleet: listing your cars, adding and editing them, and deleting them. `/vehicles` is the app's home screen after sign-in.

## Files

| Path | Role |
| --- | --- |
| `src/routes/_auth/vehicles.tsx` | `/vehicles` — header, responsive grid, empty state, "Add Vehicle" modal trigger |
| `src/features/vehicle-card/vehicle-card.tsx` | One card: image, make/model, plate, next service, delete button |
| `src/features/vehicle-card/getStatusColorClasses.ts` | Maps the next-service date to a background color |
| `src/features/vehicle-details/vehicle-form-modal.tsx` | NextUI `Modal` shell around the form |
| `src/features/vehicle-form/vehicle.form.tsx` | The add/edit form itself (both modes) |
| `src/services/useAddVehicle.ts` | Create |
| `src/services/useUpdateVehicle.ts` | Update |
| `src/services/useDeleteVehicle.ts` | Delete |
| `src/services/useFetchVehicles.ts` | The shared read (see [../architecture.md](../architecture.md)) |
| `src/types/vehicle.type.ts` | `TVehicle`, `TVehicleWithServices` |
| `src/assets/no-image.jpg` | Fallback image when `imageUrl` is empty |

## How it works

**Listing.** `/vehicles` calls `useQuery(vehiclesQueryOptions)` directly (no route loader). While loading it renders a NextUI `Spinner`; with zero vehicles it renders an empty state with an "Add Your First Vehicle" button; otherwise a `grid-cols-1 sm:2 lg:3 xl:4` grid of `VehicleCard`s.

**The card.** Clicking anywhere navigates to `/vehicles/$vehicleId`. The image is `vehicle.imageUrl` or the bundled `no-image.jpg` fallback. The card body's background comes from `getStatusColorClasses(nextService)`:

| Time until next service | Class |
| --- | --- |
| `none` | `bg-white` |
| `overdue` | `bg-red-100` |
| `due-soon` | `bg-orange-50` |
| `upcoming` | `bg-amber-50` |
| `ok` | `bg-green-50` |

The thresholds come from `getServiceUrgency` in `src/utils/serviceDue.ts` — see [reminders-calendar.md](reminders-calendar.md). When a next-service date exists, the card also renders an `AddToCalendar` dropdown.

**The card is a stretched link.** The card body is a plain container; a real TanStack `<Link>` is overlaid across it with `absolute inset-0 z-10`, and the interactive controls (delete button, calendar dropdown) sit above it at `z-20`. It used to be a `<div onClick={navigate}>`, which could not be focused or activated from the keyboard and supported neither middle-click nor modifier-click. Putting the controls *inside* the `<a>` instead is not an option: React propagates events from portalled content through the React tree, so even a modal's Cancel button would follow the link.

The delete button stays visible on touch (`opacity-100 md:opacity-0 md:group-hover:opacity-100`). Hover-only was actively unsafe on a phone: an `opacity-0` button still receives taps, so the corner of every card was an invisible destructive control. It opens `ConfirmDialog` rather than the native `confirm()`.

**Finding a vehicle.** Once the fleet passes three vehicles the list route shows a search input (matching make, model, plate and year) and a sort select — by next service due (most urgent first, via `getServiceUrgency`), by make and model, or newest first. Both are local `useState` filtering the `["vehicles"]` cache in a `useMemo`; nothing extra is fetched. While loading, the grid renders `VehicleCardSkeleton` placeholders instead of collapsing to a centered spinner.

**Add / edit.** `VehicleFormModal` takes `mode: "add" | "edit"` and an optional `vehicle`, and renders `VehicleForm` inside a `Modal`. The form is uncontrolled: `useRef` per input plus `defaultValue`, and a `useEffect` that imperatively fills the refs in edit mode (needed because the modal mounts before the vehicle prop settles). Fields: make, model, year (`min` 1900, `max` current year + 1), plate, and image URL. In edit mode the current image is previewed above the URL field. Submit calls `addVehicle` or `updateVehicle` and closes the modal via `onSuccess`.

Both modals are mounted from two places: the list route (`mode="add"`) and `vehicle-details.tsx` (`mode="edit"`).

**Delete.** `useDeleteVehicle` first clears the `services` subcollection with `writeBatch` (in chunks of 500, the batch limit) — Firestore does not cascade — then deletes `vehicles/{id}` and patches `["vehicles"]` with `setQueryData` rather than refetching. From the detail page, `vehicle-details.tsx` passes an extra `onSuccess` that navigates back to `/vehicles`.

## Data touched

- Firestore: `vehicles/{vehicleId}` — `make`, `model`, `year`, `plate`, `imageUrl`.
- Query key: `["vehicles"]`.
- `nextServiceDate` lives on this document but is written by the service form, not the vehicle form — see [reminders-calendar.md](reminders-calendar.md).

## Extending it

- **A new vehicle field** (VIN, color, fuel type): add it to `TVehicle`, to the `AddVehicleData`/`UpdateVehicleData` interfaces and payload objects in `useAddVehicle.ts`/`useUpdateVehicle.ts`, and to `vehicle.form.tsx` (a ref, an `Input`, the `formData` object, and the edit-mode `useEffect`). `useFetchVehicles` spreads `doc.data()`, so reads need no change.
- **Changing urgency colors**: `getStatusColorClasses.ts` only — but note the dashboard uses its own separate thresholds ([dashboard.md](dashboard.md)).
- **Filtering or sorting the grid**: derive it in `src/routes/_auth/vehicles.tsx` from the query result; don't add a second Firestore query.

## By design

**The fleet is shared.** `fetchVehicles` reads the entire `vehicles` collection with no `where` clause, and writes never set a `userId`, so every signed-in account sees and edits the same vehicles. That is the point — this is a shared family garage, not a per-user app. Don't add owner scoping unless asked.

The deployed Firestore rules match that: read and write are allowed on `vehicles/{vehicle}` and `vehicles/{vehicle}/services/{serviceId}` whenever `request.auth != null`. Worth knowing that Google sign-in is open to the world, so "signed in" means any Google account, not any *family* account — narrowing that means an allowlist in the rules (`request.auth.uid in [...]`), not application code.

## Known gaps

- Vehicle images are URLs typed by hand. Firebase Storage is configured and exported in `src/config/firebase.ts` but never used, so there is no upload path.
- Search and sort are client-side over the whole `["vehicles"]` cache — fine for a family fleet, but there is no Firestore `limit`/`startAfter` pagination behind them.
- The search box only appears once the fleet has more than three vehicles, so the control moves into and out of the page as the fleet grows.
- `useUpdateVehicle`'s `UpdateVehicleData.imageUrl` is required while `useAddVehicle`'s is optional; the form always sends a string (`?? ""`), so this is only a type-level inconsistency.
