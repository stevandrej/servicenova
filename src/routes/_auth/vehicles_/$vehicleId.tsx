import { createFileRoute } from "@tanstack/react-router";
import { VehicleDetails } from "../../../components/vehicle-details.tsx/VehicleDetails";
import { vehiclesQueryOptions } from "../../../services/useFetchVehicles";
import { Link } from "@tanstack/react-router";
import { vehicleServicesQueryOptions } from "../../../services/useFetchVehicleServices";
import { TVehicleWithServices } from "../../../types/vehicle.type";

export const Route = createFileRoute("/_auth/vehicles_/$vehicleId")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { vehicleId } }) => {
    const vehicles = await queryClient.ensureQueryData(vehiclesQueryOptions);
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === vehicleId
    );

    if (!selectedVehicle) {
      throw new Error("Vehicle not found");
    }

    const vehicleServices = await queryClient.ensureQueryData(
      vehicleServicesQueryOptions(vehicleId)
    );

    return {
      ...selectedVehicle,
      services: vehicleServices,
    } as TVehicleWithServices;
  },
});

function RouteComponent() {
  const vehicle = Route.useLoaderData();

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
