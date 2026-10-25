# Feature: vehicle-card

The card shown for each vehicle in the `/vehicles` grid (`src/routes/_auth/vehicles.tsx`). See the root `CLAUDE.md` for app-wide conventions.

## Files

- `vehicle-card.tsx`: `VehicleCard({ vehicle, nextService? })`. Shows the image, make/model, plate, and next service date with an `AddToCalendar` dropdown.
- `getStatusColorClasses.ts`: maps `nextService` to a background class for the card footer:
  - no date → `bg-white`
  - ≤ 1 month away (or overdue) → `bg-red-50`
  - ≤ 3 months → `bg-orange-50`
  - otherwise → `bg-green-50`

## Behaviour

- Clicking the card navigates to `/vehicles/$vehicleId`.
- A delete button appears on hover. It asks for `confirm()`, then calls `useDeleteVehicle`, which removes the vehicle from the `["vehicles"]` cache.
- The image falls back to `src/assets/no-image.jpg` when `imageUrl` is empty.

## Gotchas

- The whole card is clickable, so nested interactive elements must not trigger navigation. `AddToCalendar` is wrapped in a `div` with `onClick={e => e.stopPropagation()}`. Do the same for anything new you add inside the card.
- The parent route passes `nextService` separately from `vehicle.nextServiceDate` (`vehicle.nextServiceDate ?? undefined`).
