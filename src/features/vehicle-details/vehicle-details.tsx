import { useMemo, useState, useCallback } from "react";
import { useDisclosure } from "@nextui-org/react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteVehicle } from "../../services/useDeleteVehicle";
import { TVehicleWithServices } from "../../types/vehicle.type";
import { TService } from "../../types/service.type";
import { formatDateToLongDate } from "../../utils/formatDate";
import { ServiceFormModal } from "./service-form-modal";
import { VehicleHeader } from "./components/vehicle-header";
import { VehicleInfo } from "./components/vehicle-info";
import { ServiceHistory } from "./components/service-history";
import { ServiceItem } from "./service-item";
import { VehicleFormModal } from "./vehicle-form-modal";

interface VehicleDetailsProps {
  vehicle: TVehicleWithServices;
}

export const VehicleDetails = ({ vehicle }: VehicleDetailsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isEditModalOpen, 
    onOpen: onOpenEditModal, 
    onClose: onCloseEditModal 
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

  const handleEditService = useCallback((service: TService) => {
    setSelectedService(service);
    setMode("edit");
    onOpen();
  }, [onOpen]);

  const handleDeleteVehicle = useCallback(() => {
    if (confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      deleteVehicle(vehicle.id, {
        onSuccess: () => {
          navigate({ to: "/vehicles" });
        },
      });
    }
  }, [deleteVehicle, vehicle.id, navigate]);

  const sortedServices = useMemo(() => 
    [...vehicle.services].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [vehicle.services]
  );

  const timelineData = useMemo(() => 
    sortedServices.map((service) => ({
      title: formatDateToLongDate(service.date),
      content: (
        <ServiceItem
          vehicleId={vehicle.id}
          service={service}
          onEdit={() => handleEditService(service)}
        />
      ),
    })),
    [sortedServices, vehicle.id, handleEditService]
  );

  const totalSpent = useMemo(() => 
    vehicle.services.reduce((acc, service) => acc + service.price, 0),
    [vehicle.services]
  );

  const lastServiceDate = useMemo(() => 
    sortedServices[0]?.date || null,
    [sortedServices]
  );

  const currentMileage = useMemo(() => 
    Math.max(...vehicle.services.map((s) => s.mileage), 0),
    [vehicle.services]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VehicleHeader
        onEdit={onOpenEditModal}
        onDelete={handleDeleteVehicle}
        isDeleting={isDeleting}
      />

      <VehicleInfo
        vehicle={vehicle}
        onAddService={handleAddService}
        lastServiceDate={lastServiceDate}
        totalSpent={totalSpent}
        currentMileage={currentMileage}
      />

      <ServiceHistory
        timelineData={timelineData}
        onAddService={handleAddService}
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
    </div>
  );
};

VehicleDetails.displayName = "VehicleDetails";
