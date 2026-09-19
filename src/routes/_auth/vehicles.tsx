import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { VehicleList } from "../../features/vehicle-list/vehicle-list";

export const Route = createFileRoute("/_auth/vehicles")({
  // Matches /dashboard, so defaultPreload: "intent" can warm this route on
  // hover instead of showing skeletons after the click.
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(vehiclesQueryOptions),
  component: VehicleList,
});
