import { memo } from "react";
import { TService } from "../../types/service.type";
import { Button } from "@nextui-org/react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useDeleteService } from "../../services/useDeleteService";

interface ServiceItemProps {
  vehicleId: string;
  service: TService;
  onEdit: () => void;
}

export const ServiceItem = memo(({ vehicleId, service, onEdit }: ServiceItemProps) => {
  const { mutate: deleteService } = useDeleteService();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this service record?")) {
      deleteService({vehicleId, serviceId: service.id}, {
        onSuccess: () => {
          toast.success("Service record deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete service record");
        },
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">{service.serviceType}</h3>
          <p className="text-sm text-gray-600">
            Mileage: {service.mileage.toLocaleString()} km
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onEdit}
          >
            <IconEdit size={18} />
          </Button>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            color="danger"
            onPress={handleDelete}
          >
            <IconTrash size={18} />
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{service.notes}</p>
        <p className="font-semibold">${service.price.toLocaleString()}</p>
      </div>
    </div>
  );
});

ServiceItem.displayName = "ServiceItem";
