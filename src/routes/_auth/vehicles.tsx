import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { VehicleCard } from "../../features/vehicle-card/VehicleCard";
import { cn } from "../../lib/utils";
import { Button, Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import { IconPlus } from "@tabler/icons-react";
import { AddVehicleForm } from "../../features/add-vehicle-form/add-vehicle.form";

export const Route = createFileRoute("/_auth/vehicles")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(vehiclesQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const vehicles = Route.useLoaderData();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Vehicles</h1>
          <p className="text-gray-500">Manage and track your vehicle services</p>
        </div>
        <Button 
          color="primary" 
          endContent={<IconPlus size={20} />}
          onClick={onOpen}
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
          <h3 className="text-xl font-semibold text-gray-700">No vehicles yet</h3>
          <p className="text-gray-500 mb-4">Add your first vehicle to get started</p>
          <Button 
            color="primary"
            onClick={onOpen}
          >
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              nextService={new Date("2024-09-10")}
            />
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          {(onClose) => (
            <AddVehicleForm onSuccess={onClose} />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
