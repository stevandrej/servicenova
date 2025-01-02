import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../../services/useFetchVehicles";
import { Link } from "@tanstack/react-router";
import { TVehicle } from "../../../types/vehicle.type";
import { VehicleDetails } from "../../../features/vehicle-details/vehicle-details";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@nextui-org/react";

export const Route = createFileRoute("/_auth/vehicles_/$vehicleId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { vehicleId } = Route.useParams();
  const { data: vehicles, isLoading: isLoadingVehicles } =
    useQuery(vehiclesQueryOptions);
  const vehicle = vehicles?.find((v: TVehicle) => v.id === vehicleId);
  const isLoading = isLoadingVehicles;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600">
            The requested vehicle could not be found.
          </p>
          <Link
            to="/vehicles"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            Return to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return <VehicleDetails vehicle={vehicle} />;
}
