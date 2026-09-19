import { createFileRoute } from "@tanstack/react-router";
import { VehicleDetailsPage } from "../../../features/vehicle-details/vehicle-details-page";

export const Route = createFileRoute("/_auth/vehicles_/$vehicleId")({
  component: VehicleDetailsPage,
});
