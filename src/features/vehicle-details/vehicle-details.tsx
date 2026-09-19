import { useMemo, useState, useCallback } from "react";
import { useDisclosure } from "@nextui-org/react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteVehicle } from "../../services/useDeleteVehicle";
import { TVehicleWithServices } from "../../types/vehicle.type";
import { TService } from "../../types/service.type";
import { ServiceFormModal } from "./service-form-modal";
import { VehicleHeader } from "./components/vehicle-header";
import { VehicleInfo } from "./components/vehicle-info";
import { ServiceHistory } from "./components/service-history";
import { VehicleFormModal } from "./vehicle-form-modal";
import { ConfirmDialog } from "../../components/confirm-dialog";

interface VehicleDetailsProps {
  vehicle: TVehicleWithServices;
}

export const VehicleDetails = ({ vehicle }: VehicleDetailsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();
  const [selectedService, setSelectedService] = useState<TService | null>(null);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const navigate = useNavigate();
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();

  const handleAddService = useCallback(() => {
    setSelectedService(null);
    setMode("add");
    onOpen();
  }, [onOpen]);

  const handleEditService = useCallback(
    (service: TService) => {
      setSelectedService(service);
      setMode("edit");
      onOpen();
    },
    [onOpen]
  );

  const handleDeleteVehicle = useCallback(() => {
    onCloseDelete();
    deleteVehicle(vehicle.id, {
      onSuccess: () => {
        navigate({ to: "/vehicles" });
      },
    });
  }, [deleteVehicle, vehicle.id, navigate, onCloseDelete]);

  // vehicle.services is already newest-first: fetchVehicles sorts it,
  // useAddService re-sorts its cache patch, and useDeleteService only filters.
  const totalSpent = useMemo(
    () => vehicle.services.reduce((acc, service) => acc + service.price, 0),
    [vehicle.services]
  );

  const lastServiceDate = vehicle.services[0]?.date ?? null;

  const currentMileage = useMemo(
    () => Math.max(...vehicle.services.map((s) => s.mileage), 0),
    [vehicle.services]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VehicleHeader
        onEdit={onOpenEditModal}
        onDelete={onOpenDelete}
        isDeleting={isDeleting}
        vehicle={vehicle}
      />

      <VehicleInfo
        vehicle={vehicle}
        onAddService={handleAddService}
        lastServiceDate={lastServiceDate}
        totalSpent={totalSpent}
        currentMileage={currentMileage}
      />

      <ServiceHistory
        services={vehicle.services}
        vehicleId={vehicle.id}
        onAddService={handleAddService}
        onEditService={handleEditService}
      />

      <ServiceFormModal
        isOpen={isOpen}
        onClose={onClose}
        mode={mode}
        service={selectedService}
        vehicleId={vehicle.id}
        nextService={vehicle.nextServiceDate}
      />

      <VehicleFormModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        vehicle={vehicle}
        mode="edit"
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onCloseDelete}
        onConfirm={handleDeleteVehicle}
        title="Delete vehicle?"
        body={`${vehicle.make} ${vehicle.model} (${vehicle.plate}) and all ${vehicle.services.length} of its service records will be permanently deleted. This cannot be undone.`}
        isPending={isDeleting}
      />
    </div>
  );
};

VehicleDetails.displayName = "VehicleDetails";
