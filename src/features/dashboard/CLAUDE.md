# Feature: dashboard

Fleet-wide overview at `/dashboard`. See the root `CLAUDE.md` for app-wide conventions.

## Data

- Route `src/routes/_auth/dashboard.tsx` loader: `queryClient.ensureQueryData(vehiclesQueryOptions)`.
- `Dashboard` reads it with `DashboardRoute.useLoaderData()` (not `useQuery`) and passes `vehicles: TVehicleWithServices[]` down to each section. Everything is derived client-side in `useMemo`. There are no extra queries.

## Files

- `dashboard.tsx`: composes the three sections below.
- `components/overview.tsx`: `Overview`. Totals for vehicles, services, and spend (MKD), plus "Upcoming Services" = vehicles whose `nextServiceDate` is within the next 30 days (overdue ones count too). Also computes `averagePerVehicle`, which isn't rendered yet.
- `components/vehicles-need-attention.tsx`: `VehiclesNeedAttention`. Flags vehicles with no services, a last service more than 320 days ago, or a next service due within 30 days. Shows only the first 3. Relies on `services[0]` being the newest, because `fetchVehicles` sorts that way.
- `components/monthly-spending-chart.tsx`: `MonthlySpendingChart`. Last 6 months as NextUI `Progress` bars, scaled to the max month.

## Gotchas

- Section components are **default exports**. Elsewhere the app uses named exports.
- Monthly spending matches services by short month name only (`"Jan"`, `"Feb"`, …) and ignores the year, so a service from the same month in a previous year is counted too. Month names use the `"default"` locale, not en-GB.
- Metric tiles reuse `VehicleMetricCard` from `../vehicle-details/vehicle-metric-card`.
