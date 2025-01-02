import { Button } from "@nextui-org/react";
import { IconPlus } from "@tabler/icons-react";
import { TVehicleWithServices } from "../../../types/vehicle.type";
import { VehicleMetricCard } from "../VehicleMetricCard";
import { formatDateToLongDate } from "../../../utils/formatDate";

interface VehicleInfoProps {
  vehicle: TVehicleWithServices;
  onAddService: () => void;
  lastServiceDate: Date | null;
  totalSpent: number;
  currentMileage: number;
}

export const VehicleInfo = ({
  vehicle,
  onAddService,
  lastServiceDate,
  totalSpent,
  currentMileage,
}: VehicleInfoProps) => {
  return (
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
          onPress={onAddService}
        >
          Add Service
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
        <VehicleMetricCard
          title="Next Service Due"
          value={
            vehicle.nextServiceDate
              ? formatDateToLongDate(vehicle.nextServiceDate)
              : "Not scheduled"
          }
        />
        <VehicleMetricCard
          title="Last Service"
          value={
            lastServiceDate
              ? formatDateToLongDate(lastServiceDate)
              : "No services"
          }
          description={lastServiceDate ? vehicle.services[0]?.serviceType : "No service history"}
        />
        <VehicleMetricCard
          title="Total Services"
          value={vehicle.services.length.toString()}
        />
        <VehicleMetricCard
          title="Total Spent"
          value={`${totalSpent.toLocaleString()} MKD`}
        />
        <VehicleMetricCard
          title="Current Mileage"
          value={`${currentMileage.toLocaleString()}`}
          description="Kilometers"
        />
      </div>
    </div>
  );
}; 