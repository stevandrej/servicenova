import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";

export const Route = createFileRoute("/_auth/vehicles")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(vehiclesQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const vehicles = Route.useLoaderData();

  console.log(vehicles);

  //TODO: render the cars list
  return <>Vehicles here...</>;
}
