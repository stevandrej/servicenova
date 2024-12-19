import { TVehicle } from "../../types/vehicle.type";
import { cn } from "../../lib/utils";
import { getStatusColorClasses } from "./getStatusColorClasses";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@nextui-org/react";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteVehicle } from "../../services/useDeleteVehicle";

interface VehicleCardProps {
  vehicle: TVehicle;
  nextService?: Date;
}

export const VehicleCard = ({ vehicle, nextService }: VehicleCardProps) => {
  const statusColorClasses = getStatusColorClasses(nextService);
  const navigate = useNavigate();
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();

  const handleClick = () => {
    navigate({
      to: `/vehicles/$vehicleId`,
      params: { vehicleId: vehicle.id },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      deleteVehicle(vehicle.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative rounded-md overflow-hidden w-full shadow-lg transform-gpu transition-transform duration-400 hover:scale-[1.01] hover:cursor-pointer group"
    >
      {/* Delete Button - Visible on Hover */}
      <Button
        isIconOnly
        color="danger"
        variant="flat"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onPress={handleDelete}
        isLoading={isDeleting}
      >
        <IconTrash size={18} />
      </Button>

      {/* Image */}
      <div className="bg-neutral-200">
        <img
          src={`https://images.unsplash.com/photo-1523998172836-07d4ac80b873?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-center object-cover"
        />
      </div>

      {/* Content */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-75%",
          statusColorClasses
        )}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-outfit text-lg font-semibold tracking-tight leading-none">
            <span className="capitalize">{vehicle.make}</span>{" "}
            <span className="capitalize">{vehicle.model}</span>
          </h3>
          <p className="font-outfit text-sm opacity-80 font-medium tracking-wide uppercase">
            <span className="text-xs tracking-tight normal-case">
              Plate Number:
            </span>{" "}
            {vehicle.plate}
          </p>
          {nextService && (
            <p className="font-outfit text-sm opacity-80 font-medium tracking-wide">
              <span className="text-xs tracking-tight">Next Service:</span>{" "}
              {nextService.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
