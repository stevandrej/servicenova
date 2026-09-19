import { Modal, ModalContent } from "@nextui-org/react";
import { TVehicle } from "../../types/vehicle.type";
import { VehicleForm } from "../vehicle-form/vehicle.form";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: TVehicle;
  mode: "add" | "edit";
}

export const VehicleFormModal = ({
  isOpen,
  onClose,
  vehicle,
  mode,
}: VehicleFormModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      // Same keyboard handling as the service form - see service-form-modal.tsx.
      placement="top-center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[calc(100%_-_0.5rem)] sm:max-h-[calc(100%_-_8rem)]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <VehicleForm mode={mode} vehicle={vehicle} onSuccess={onClose} />
        )}
      </ModalContent>
    </Modal>
  );
}; 