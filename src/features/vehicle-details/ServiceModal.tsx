import { useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  CalendarDate,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { TService } from "../../types/service.type";
import { toast } from "react-toastify";
import { useAddService } from "../../services/useAddService";
import { useUpdateService } from "../../services/useUpdateService";
import { parseDate } from "@internationalized/date";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  service?: TService | null;
  vehicleId: string;
}

export const ServiceModal = ({
  isOpen,
  onClose,
  mode,
  service,
  vehicleId,
}: ServiceModalProps) => {
  const [date, setDate] = useState<CalendarDate>(
    service?.date 
      ? parseDate(service.date.toISOString().split('T')[0])
      : parseDate(new Date().toISOString().split('T')[0])
  );
  const [nextServiceDate, setNextServiceDate] = useState<CalendarDate | undefined>(
    service?.nextServiceDate 
      ? parseDate(service.nextServiceDate.toISOString().split('T')[0])
      : undefined
  );
  const mileageRef = useRef<HTMLInputElement>(null);
  const serviceTypeRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: addService, isPending: isAdding } = useAddService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const serviceData = {
      date: new Date(date.toString()),
      mileage: Number(mileageRef.current?.value),
      serviceType: serviceTypeRef.current?.value || "",
      price: Number(priceRef.current?.value),
      notes: notesRef.current?.value || "",
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate.toString()) : undefined,
    };

    if (mode === "add") {
      addService(
        { vehicleId, service: serviceData },
        {
          onSuccess: () => {
            toast.success("Service record added successfully");
            onClose();
          },
          onError: () => {
            toast.error("Failed to add service record");
          },
        }
      );
    } else {
      updateService(
        { serviceId: service!.id, service: serviceData },
        {
          onSuccess: () => {
            toast.success("Service record updated successfully");
            onClose();
          },
          onError: () => {
            toast.error("Failed to update service record");
          },
        }
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {mode === "add" ? "Add New Service" : "Edit Service"}
            </ModalHeader>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Service Date"
                  value={date}
                  onChange={(newDate) => newDate && setDate(newDate)}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Input
                  type="number"
                  label="Mileage"
                  ref={mileageRef}
                  defaultValue={service?.mileage.toString()}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>
              <Input
                label="Service Type"
                ref={serviceTypeRef}
                defaultValue={service?.serviceType}
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />
              <Input
                type="number"
                label="Price"
                ref={priceRef}
                defaultValue={service?.price.toString()}
                startContent={<span>$</span>}
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />
              <DatePicker
                label="Next Service Date"
                value={nextServiceDate}
                onChange={(newDate) => newDate && setNextServiceDate(newDate)}
                variant="bordered"
                labelPlacement="outside"
                description="When should a service be performed again?"
              />
              <Textarea
                label="Notes"
                ref={notesRef}
                defaultValue={service?.notes}
                variant="bordered"
                labelPlacement="outside"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isAdding || isUpdating}
              >
                {mode === "add" ? "Add Service" : "Update Service"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};