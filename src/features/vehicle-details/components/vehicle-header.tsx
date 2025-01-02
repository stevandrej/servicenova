import { Button } from "@nextui-org/react";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";

interface VehicleHeaderProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const VehicleHeader = ({ onEdit, onDelete, isDeleting }: VehicleHeaderProps) => {
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
      <div className="flex gap-2 flex-1 md:justify-end justify-between">
        <Button
          color="primary"
          variant="light"
          startContent={<IconEdit size={18} />}
          onPress={onEdit}
        >
          Edit Vehicle
        </Button>
        <Button
          color="danger"
          variant="light"
          isLoading={isDeleting}
          startContent={<IconTrash size={18} />}
          onPress={onDelete}
        >
          Delete Vehicle
        </Button>
      </div>
    </div>
  );
}; 