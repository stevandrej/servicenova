# Feature: vehicle-details

The core screen at `/vehicles/$vehicleId`: vehicle info, metrics, and the service history timeline, where services are added, edited and deleted. See the root `CLAUDE.md` for app-wide conventions and the data model.

## Data

- Route `src/routes/_auth/vehicles_/$vehicleId.tsx` runs `useQuery(vehiclesQueryOptions)` and finds the vehicle by id. There is no per-vehicle query. It handles the loading and "not found" states, then renders `VehicleDetails`.
- Everything below receives a `TVehicleWithServices` and derives from it.

## Files

- `vehicle-details.tsx`: `VehicleDetails`, the orchestrator. It owns modal state (`useDisclosure` for the service modal and the vehicle edit modal, plus `selectedService` and `mode`) and the derived metrics:
  - total spent = sum of `price`
  - last service = newest service by date
  - current mileage = **max `mileage` across services** (there is no odometer field on the vehicle)
- `components/vehicle-header.tsx`: back, edit vehicle, and delete vehicle buttons. Delete asks for `confirm()`, then navigates to `/vehicles`.
- `components/vehicle-info.tsx`: title and the metric cards (next service due with `AddToCalendar`, last service, total services, total spent in MKD, current mileage in km).
- `components/service-history.tsx`: the shared `Timeline` (`src/components/timeline/Timeline.tsx`), or an empty state.
- `service-item.tsx`: a single service entry (type, mileage, notes, price) with edit and delete. It's memoised.
- `service-form-modal.tsx`: `ServiceFormModal`, used for both adding and editing a service.
- `vehicle-form-modal.tsx`: `VehicleFormModal`, a thin `Modal` wrapper around `../vehicle-form/vehicle.form.tsx`. Also used by the `/vehicles` page for "Add Vehicle".
- `vehicle-metric-card.tsx`: `VehicleMetricCard` tile. Also reused by the dashboard.

## Service form

- Fields: service date (required), mileage, service type, price (MKD), notes (all required), and next service date (optional).
- Dates use NextUI `DatePicker` with `CalendarDate` from `@internationalized/date`. They're converted to Firestore `Timestamp` in `handleSubmit`.
- The "next service date" field is pre-filled from the **vehicle's** `nextServiceDate`, even in edit mode. It isn't taken from the service being edited.
- Add → `useAddService`: writes the service doc, sets the vehicle's `nextServiceDate`, and patches the cache.
- Edit → `useUpdateService`: updates the service doc, then refetches `["vehicles"]`.
- Delete (in `ServiceItem`) → `useDeleteService`: patches the cache.

## Gotchas

- Adding a service with an empty next-service date clears the vehicle's `nextServiceDate`. Editing a service never updates the vehicle's `nextServiceDate`, even if the field changed.
- Deleting a service doesn't recalculate the vehicle's `nextServiceDate`.
- Date conversion goes through `toISOString().split("T")[0]`, which can shift the date by a day in timezones ahead of UTC.
- `timelineData` is built in `VehicleDetails` as `{ title: formatted date, content: <ServiceItem/> }`. Change the shape there and in `Timeline` together.
