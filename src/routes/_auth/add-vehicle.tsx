import { createFileRoute } from "@tanstack/react-router";
import { AddVehicleForm } from "../../features/add-vehicle-form/add-vehicle.form";

export const Route = createFileRoute("/_auth/add-vehicle")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AddVehicleForm />;
}
