import { Button } from "@nextui-org/react";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { TVehicleWithServices } from "../../../types/vehicle.type";
import { vehicleSlug } from "../../../utils/exportVehicles";
import { ExportMenu } from "../../../components/export-menu";

interface VehicleHeaderProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  vehicle: TVehicleWithServices;
}

export const VehicleHeader = ({
  onEdit,
  onDelete,
  isDeleting,
  vehicle,
}: VehicleHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center flex-wrap">
      <Button
        variant="light"
        startContent={<IconArrowLeft size={18} />}
        onPress={() => navigate({ to: "/vehicles" })}
        className="mb-2"
      >
        Back to Vehicles
      </Button>
      {/* Full width below sm, so the actions get their own row on a phone. */}
      <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-1 md:justify-end justify-between items-center">
        <ExportMenu
          vehicles={[vehicle]}
          slug={vehicleSlug(vehicle)}
          variant="light"
        />
        <Button
          color="primary"
          variant="light"
          startContent={<IconEdit size={18} />}
          onPress={onEdit}
        >
          Edit<span className="hidden sm:inline"> Vehicle</span>
        </Button>
        <Button
          color="danger"
          variant="light"
          isLoading={isDeleting}
          startContent={<IconTrash size={18} />}
          onPress={onDelete}
        >
          Delete<span className="hidden sm:inline"> Vehicle</span>
        </Button>
      </div>
    </div>
  );
}; 