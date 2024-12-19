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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="outside">
      <ModalContent>
        {(onClose) => (
          <VehicleForm mode={mode} vehicle={vehicle} onSuccess={onClose} />
        )}
      </ModalContent>
    </Modal>
  );
}; 