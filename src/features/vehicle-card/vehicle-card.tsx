import { TVehicle } from "../../types/vehicle.type";
import { cn } from "../../lib/utils";
import { getStatusColorClasses } from "./getStatusColorClasses";
import { Link } from "@tanstack/react-router";
import { Button, useDisclosure } from "@nextui-org/react";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteVehicle } from "../../services/useDeleteVehicle";
import fallbackVehicleImage from "../../assets/no-image.jpg";
import { AddToCalendar } from "../../components/add-to-calendar";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { formatDate } from "../../utils/formatDate";

interface VehicleCardProps {
  vehicle: TVehicle;
  nextService?: Date;
}

export const VehicleCard = ({ vehicle, nextService }: VehicleCardProps) => {
  const statusColorClasses = getStatusColorClasses(nextService);
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    // Stretched-link layout: the card itself stays a plain container, and a
    // real <Link> is overlaid across it. Nesting the delete button, the
    // calendar dropdown or a modal *inside* an <a> would navigate on every
    // click - React propagates portalled events through the React tree, so
    // even the modal's Cancel button would follow the link.
    <div
      className={cn(
        "relative rounded-md overflow-hidden w-full shadow-lg group",
        "transform-gpu transition-transform duration-300 hover:scale-[1.01]",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      )}
    >
      {/* Image */}
      <div className="bg-neutral-200 h-64">
        <img
          src={vehicle.imageUrl || fallbackVehicleImage}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className={cn("p-4 bg-gradient-to-t from-75%", statusColorClasses)}>
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
            <div className="flex flex-row items-center justify-between gap-2">
              <p className="font-outfit text-sm opacity-80 font-medium tracking-wide">
                <span className="text-xs tracking-tight">Next Service:</span>{" "}
                {formatDate(nextService)}
              </p>
              {/* Lifted above the link overlay so it stays clickable. */}
              <div className="relative z-20">
                <AddToCalendar
                  date={nextService}
                  vehicleMake={vehicle.make}
                  vehicleModel={vehicle.model}
                  vehiclePlate={vehicle.plate}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The link overlay. Text underneath is not interactive, so covering it
          is what makes the whole card clickable. */}
      <Link
        to="/vehicles/$vehicleId"
        params={{ vehicleId: vehicle.id }}
        aria-label={`${vehicle.make} ${vehicle.model}, plate ${vehicle.plate}`}
        className="absolute inset-0 z-10 rounded-md focus:outline-none"
      />

      {/* Delete. Kept visible on touch: an opacity-0 button still receives
          taps, so hover-only made the corner of every card an invisible
          destructive control on a phone. */}
      <div className="absolute top-2 right-2 z-20">
        <Button
          isIconOnly
          color="danger"
          variant="flat"
          size="sm"
          aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity"
          onPress={onOpen}
          isLoading={isDeleting}
        >
          <IconTrash size={18} />
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => {
          deleteVehicle(vehicle.id);
          onClose();
        }}
        title="Delete vehicle?"
        body={`${vehicle.make} ${vehicle.model} (${vehicle.plate}) and all of its service records will be permanently deleted. This cannot be undone.`}
        isPending={isDeleting}
      />
    </div>
  );
};
