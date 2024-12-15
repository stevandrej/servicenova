import { memo, useMemo, useState, useCallback } from "react";
import type { TVehicleWithServices } from "../../types/vehicle.type";
import { formatDate } from "../../utils/formatDate";
import { Timeline } from "../../components/timeline/Timeline";
import { ServiceItem } from "./ServiceItem";
import { Button, useDisclosure } from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { ServiceModal } from "./ServiceModal";
import { TService } from "../../types/service.type";
import { VehicleMetricCard } from "./VehicleMetricCard";
import { useNavigate } from "@tanstack/react-router";

interface VehicleDetailsProps {
  vehicle: TVehicleWithServices;
}

export const VehicleDetails = memo(({ vehicle }: VehicleDetailsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState<TService | null>(null);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const navigate = useNavigate();

  const handleAddService = () => {
    setSelectedService(null);
    setMode("add");
    onOpen();
  };

  const handleEditService = useCallback((service: TService) => {
    setSelectedService(service);
    setMode("edit");
    onOpen();
  }, [onOpen]);

  const sortedServices = useMemo(() => 
    [...vehicle.services].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [vehicle.services]
  );

  const timelineData = useMemo(
    () =>
      sortedServices.map((service) => ({
        title: formatDate(service.date),
        content: (
          <ServiceItem
            service={service}
            onEdit={() => handleEditService(service)}
          />
        ),
      })),
    [sortedServices, handleEditService]
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
    Math.max(...vehicle.services.map(s => s.mileage), 0),
    [vehicle.services]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="light"
        startContent={<IconArrowLeft size={18} />}
        onPress={() => navigate({ to: "/vehicles" })}
        className="mb-2"
      >
        Back to Vehicles
      </Button>

      {/* Vehicle Header */}
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-gray-500">
              {vehicle.year} • {vehicle.plate}
            </p>
          </div>
          <Button
            color="primary"
            endContent={<IconPlus size={18} />}
            onPress={handleAddService}
          >
            Add Service
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <VehicleMetricCard
            title="Total Services"
            value={vehicle.services.length.toString()}
          />
          <VehicleMetricCard
            title="Last Service"
            value={lastServiceDate ? formatDate(lastServiceDate) : "No services"}
            description={lastServiceDate ? `${sortedServices[0]?.serviceType}` : "No service history"}
          />
          <VehicleMetricCard
            title="Total Spent"
            value={`$${totalSpent.toLocaleString()}`}
          />
          <VehicleMetricCard
            title="Current Mileage"
            value={`${currentMileage.toLocaleString()}`}
            description="Kilometers"
          />
        </div>
      </div>

      {/* Service Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Service History</h2>
        {timelineData.length > 0 ? (
          <Timeline data={timelineData} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No service records found</p>
            <Button
              color="primary"
              variant="light"
              onPress={handleAddService}
              className="mt-2"
            >
              Add First Service Record
            </Button>
          </div>
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isOpen}
        onClose={onClose}
        mode={mode}
        service={selectedService}
        vehicleId={vehicle.id}
      />
    </div>
  );
});

VehicleDetails.displayName = "VehicleDetails";