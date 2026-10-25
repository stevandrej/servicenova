# Dashboard

## Purpose

`/dashboard` — a fleet-wide summary: totals across all vehicles, which vehicles look neglected, and what maintenance has cost over the last six months.

## Files

| Path | Role |
| --- | --- |
| `src/routes/_auth/dashboard.tsx` | Route; prefetches vehicles in its `loader` |
| `src/features/dashboard/dashboard.tsx` | Stacks the panels |
| `src/features/dashboard/components/overview.tsx` | Five metric tiles |
| `src/features/dashboard/components/vehicles-need-attention.tsx` | Up to three warning cards, or an all-clear |
| `src/features/dashboard/components/reminder-permission-card.tsx` | Notification opt-in prompt (see [reminders-calendar.md](reminders-calendar.md)) |
| `src/features/dashboard/components/monthly-spending-chart.tsx` | Six-month spending bars |
| `src/features/vehicle-details/vehicle-metric-card.tsx` | Shared tile component (reused from the vehicle detail page) |
| `src/utils/serviceDue.ts` | Shared urgency thresholds and selectors |

## How it works

The route loader calls `queryClient.ensureQueryData(vehiclesQueryOptions)`, and `Dashboard` reads the result with `DashboardRoute.useLoaderData()` — this is the only screen that uses loader data rather than `useQuery`. It passes the same `TVehicleWithServices[]` to each panel, and each computes its numbers in a `useMemo`.

### Overview

| Tile | Formula |
| --- | --- |
| Total Vehicles | `vehicles.length` |
| Total Services | length of all services flattened across vehicles |
| Total Spent | sum of every service `price`, suffixed `MKD` |
| Upcoming Services | `getVehiclesDue(vehicles).length` — overdue or within `DUE_SOON_DAYS` |
| Average per Vehicle | `totalSpent / vehicles.length`, rounded, suffixed `MKD` |

### Needs Attention

Delegates to `getVehiclesNeedingAttention` in `src/utils/serviceDue.ts`, which selects vehicles that have no services at all, have not been serviced in more than `STALE_SERVICE_DAYS`, or are `overdue` / `due-soon`. Results come back sorted most urgent first, then oldest-last-service first, so the cap always shows the three that matter most.

Each match renders a warning-bordered card — linked through to the vehicle — with the make/model and "Last service: {formatDate}" or "Never". Beyond three, a "+N more vehicles need attention" line follows. When nothing qualifies the panel renders an all-clear card rather than an empty space.

### Monthly Spending

Builds the last six months as `{ year, month, label }` buckets (current month last), then sums the prices of services matching **both** the year and the month — matching on the month name alone would fold last year's September into this year's. Labels use `en-GB`, like every other date in the app. Rendered as NextUI `Progress` bars with `maxValue` set to the largest month in the window (falling back to 1 so an all-zero window doesn't divide by zero).

## Data touched

Read-only. Query key `["vehicles"]`; no mutations, no Firestore writes.

## Extending it

- **A new tile**: add the computation to the `useMemo` in `overview.tsx` and render another `VehicleMetricCard` (it accepts `title`, `value`, `description`, `icon`, `action`). The grid is `grid-cols-2 md:grid-cols-3 xl:grid-cols-5`.
- **A new panel**: create a component under `src/features/dashboard/components/`, take `vehicles: TVehicleWithServices[]` as its only prop, and add it to `dashboard.tsx`.
- **A real chart**: `monthly-spending-chart.tsx` uses `Progress` bars, not a charting library — none is installed. Adding one means a new dependency.

## Known gaps

- Every figure is fleet-wide; there is no per-vehicle cost breakdown and no spend-by-service-type view (`serviceType` is free text, so categories cannot be aggregated).
- The six-month spending window is fixed and not selectable.
- Currency is still the hardcoded string `MKD`.
