import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { VehicleCard } from "../../features/vehicle-card/VehicleCard";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/_auth/vehicles")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(vehiclesQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const vehicles = Route.useLoaderData();

  return (
    <div
      className={cn(
        "grid gap-9",
        "md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] xs:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]"
      )}
    >
      <VehicleCard vehicle={vehicles[0]} nextService={new Date("2024-09-10")} />
      <VehicleCard vehicle={vehicles[0]} nextService={new Date("2025-01-12")} />
      <VehicleCard vehicle={vehicles[0]} />
      <VehicleCard vehicle={vehicles[0]} />
      <VehicleCard vehicle={vehicles[0]} />
    </div>
  );
}
