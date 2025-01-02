import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { VehicleCard } from "../../features/vehicle-card/vehicle-card";
import { cn } from "../../lib/utils";
import { Button, Spinner, useDisclosure } from "@nextui-org/react";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { VehicleFormModal } from "../../features/vehicle-details/vehicle-form-modal";

export const Route = createFileRoute("/_auth/vehicles")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: vehicles, isLoading: isLoadingVehicles } =
    useQuery(vehiclesQueryOptions);
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isLoadingVehicles) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading vehicles ...</p>
        </div>
      </div>
    );
  }

  if (!vehicles) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No vehicles found</h2>
          <p className="text-gray-600">
            There are no vehicles in your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Vehicles</h1>
          <p className="text-gray-500">
            Manage and track your vehicle services
          </p>
        </div>
        <Button
          color="primary"
          endContent={<IconPlus size={20} />}
          onPress={onOpen}
        >
          Add Vehicle
        </Button>
      </div>

      {/* Grid of Vehicles */}
      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
          <img
            src="/empty-garage.svg"
            alt="No vehicles"
            className="w-48 h-48 mb-4 opacity-50"
          />
          <h3 className="text-xl font-semibold text-gray-700">
            No vehicles yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first vehicle to get started
          </p>
          <Button color="primary" onPress={onOpen}>
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              nextService={vehicle.nextServiceDate ?? undefined}
            />
          ))}
        </div>
      )}

      <VehicleFormModal
        isOpen={isOpen}
        onClose={onClose}
        mode="add"
        vehicle={undefined}
      />
    </div>
  );
}
