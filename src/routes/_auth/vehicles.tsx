import { createFileRoute } from "@tanstack/react-router";
import { useFetchVehicles } from "../../services/useFetchVehicles";

export const Route = createFileRoute("/_auth/vehicles")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: vehicles } = useFetchVehicles();
  
  return vehicles?.map((vehicle) => (
    <div key={vehicle.id}>{vehicle?.make}</div>
  ));
}
