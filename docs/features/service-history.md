# Service history

## Purpose

The per-vehicle detail page: every service that vehicle has had, rendered as a compact list grouped by year, plus derived metrics (total spent, last service, current mileage) and the add/edit/delete flows for service records.

## Files

| Path | Role |
| --- | --- |
| `src/routes/_auth/vehicles_/$vehicleId.tsx` | `/vehicles/:vehicleId` — thin route that renders `VehicleDetailsPage` |
| `src/features/vehicle-details/vehicle-details-page.tsx` | Finds the vehicle in the shared query, handles loading/not-found |
| `src/features/vehicle-details/vehicle-details.tsx` | Orchestrator: modal state and derived metrics |
| `src/features/vehicle-details/components/vehicle-header.tsx` | Back / Edit Vehicle / Delete Vehicle buttons |
| `src/features/vehicle-details/components/vehicle-info.tsx` | Title block + the five metric cards |
| `src/features/vehicle-details/components/service-history.tsx` | Year groups and the accordion; the empty state |
| `src/features/vehicle-details/components/service-row-header.tsx` | `serviceRowProps` — the collapsed row's icon, title and subtitle |
| `src/features/vehicle-details/components/service-row.tsx` | `ServiceRowBody` — the expanded row: notes and actions |
| `src/features/vehicle-details/service-form-modal.tsx` | Add/edit service form |
| `src/features/vehicle-details/vehicle-metric-card.tsx` | Shared metric tile (also used by the dashboard) |
| `src/utils/groupServices.ts` | `groupServicesByYear` — year buckets, totals, mileage deltas |
| `src/utils/serviceTypes.tsx` | Service-type presets and the free-text to icon matcher |
| `src/services/useAddService.ts`, `useUpdateService.ts`, `useDeleteService.ts` | Mutations |
| `src/services/isNewestService.ts` | Whether a saved record is the one the vehicle's reminder should follow |
| `src/types/service.type.ts` | `TService` |

## How it works

**Loading a vehicle.** The route does *not* fetch one vehicle. It runs `useQuery(vehiclesQueryOptions)` and does `vehicles?.find(v => v.id === vehicleId)`, rendering a skeleton that mirrors the real layout while loading, and a "Vehicle not found" panel with a button back to `/vehicles` if the id doesn't match.

**Derived values** (in `vehicle-details.tsx`):

| Value | Formula |
| --- | --- |
| `totalSpent` | sum of `service.price` |
| `lastServiceDate` | `vehicle.services[0]?.date ?? null` |
| `currentMileage` | `Math.max(...services.map(s => s.mileage), 0)` — the highest mileage ever recorded, not the newest |

There is no local re-sort: `vehicle.services` arrives newest-first from `fetchVehicles`, `useAddService` re-sorts its cache patch, and `useDeleteService` only filters.

`VehicleInfo` renders five `VehicleMetricCard`s: Next Service Due (with an `AddToCalendar` action when set), Last Service (with the service type as its description), Total Services, Total Spent, and Current Mileage (kilometers).

**The history list.** `groupServicesByYear` (`src/utils/groupServices.ts`) turns the newest-first list into year buckets, newest year first, each carrying its service count, its spend total, and per-entry `mileageDelta` — the distance since the previous record, omitted for the oldest one and whenever the difference is not positive, so a mistyped mileage shows nothing rather than a negative distance.

Years come from `getUTCFullYear`, **not** `getFullYear`. Dates are stored as UTC-midnight day values (see `src/utils/formatDate.ts`), so a 1 January record would otherwise fall into the previous year for any viewer west of UTC.

Each group renders a heading (year, count, total, split by a `Divider`) above a NextUI `Accordion` in `selectionMode="multiple"`. A collapsed row shows the icon, the `formatDayMonth` date, the service type, the mileage with its delta, and the cost; expanding reveals the notes and the Edit / Delete buttons.

> **`AccordionItem` must be a direct child of `Accordion`.** NextUI builds it on react-stately's collection API, which walks the children looking for `type.getCollectionNode` and throws `Unknown element <X> in collection` for anything else. That is why `service-row-header.tsx` exports a `serviceRowProps(service, delta)` *function* rather than a component that renders the item itself.
>
> The Edit and Delete buttons live in the expanded body for a related reason: an `AccordionItem`'s header **is** a button, so nesting buttons there would be invalid markup and every click would toggle the row.

**Service types.** `serviceType` is still free text in Firestore. `src/utils/serviceTypes.tsx` defines fourteen presets, each with a label, a Tabler icon and a keyword `match` regex; `getServiceTypeIcon` lowercases the stored value, returns the first match, and falls back to `IconTool`. Matching on keywords rather than exact labels is what lets records written before the presets existed ("Oil change + filter", "front brake pads") pick up the right icon with no migration. Order matters — `oil` is tested before `filter`, so "oil filter" reads as an oil change.

The form offers those presets through a NextUI `Autocomplete` with `allowsCustomValue`, so they are suggestions and any text still saves.

**Add / edit a service.** One modal serves both. `vehicle-details.tsx` holds `mode` and `selectedService`. `ServiceFormModal` keeps `date` and `nextServiceDate` as `CalendarDate` state and `serviceType` as string state (`Autocomplete` needs a controlled value), seeded in a `useEffect` keyed on `isOpen`/`service`/`nextService`; mileage, price and notes stay on refs. On submit it converts both dates with `dateToFirebaseTimestamp` and calls `addService` or `updateService`, closing on success.

Notes are optional. Every other field is `isRequired` except "Next Service Date".

**Delete a service.** `ServiceRowBody` opens `ConfirmDialog`, then `deleteService({ vehicleId, serviceId })` removes the doc, filters it out of the `["vehicles"]` cache, and recomputes the vehicle's `nextServiceDate` from whatever record is now newest.

## The reminder date

`nextServiceDate` is stored **on the service record that set it**, and the vehicle keeps a denormalized copy of the newest record's value so the list and dashboard can show it without loading subcollections.

- `fetchVehicles` maps it per service, then derives the vehicle's value as *the newest service's `nextServiceDate`, falling back to the vehicle document's own stored field*. That fallback is what makes the change migration-free: records saved by the older `useUpdateService` had the field stripped, so their service documents don't carry one.
- The form seeds the picker from `service.nextServiceDate` when editing, and only falls back to the vehicle's value when adding.
- `useAddService` and `useUpdateService` always write the field onto the service document, and touch the **vehicle** document only when `isNewestService` says the saved record is the most recent one.

This is what stops editing a 2023 record from silently resetting when the car is next due — the bug this section used to have.

## Data touched

- Firestore: `vehicles/{vehicleId}/services/{serviceId}` — `date`, `mileage`, `price`, `serviceType`, `notes`, `nextServiceDate`.
- `vehicles/{vehicleId}.nextServiceDate` — written only when the saved service is the newest.
- Query key: `["vehicles"]` — `useAddService`/`useDeleteService` patch it in place; `useUpdateService` refetches it.

## Extending it

- **A new service field** (workshop, invoice number, parts): add it to `TService`, to the `serviceData` object in `service-form-modal.tsx` plus an input, to the mapping in `fetchVehicles` (`useFetchVehicles.ts` builds each `TService` field by field — it does **not** spread, so a missing line here silently drops the field), and to the cache patch in `useAddService`'s `onSuccess`.
- **A new service-type preset**: add an entry to `SERVICE_TYPE_PRESETS`. Keep it above any preset whose keywords it overlaps, and check the icon name exists in the installed `@tabler/icons-react` — `IconOil`, for one, does not.
- **A new per-vehicle metric**: add a `useMemo` in `vehicle-details.tsx`, pass it into `VehicleInfo`, and render another `VehicleMetricCard`.

## Known gaps

- `currentMileage` is the maximum across all services, so a typo'd high mileage sticks permanently.
- Prices go through `formatCurrency` in `src/utils/formatCurrency.ts`, but `CURRENCY` there is still a single hardcoded code — there is no per-user or per-vehicle currency setting.
- There is no search or filter within a vehicle's history; year groups are the only way to narrow it.
- Presets classify by keyword, so a record can be decorated with an icon that disagrees with what was actually done ("belt sander" would read as a timing belt). The stored text is never rewritten, only decorated.
