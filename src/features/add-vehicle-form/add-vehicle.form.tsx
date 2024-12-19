import { useRef } from "react";
import { useAddVehicle } from "../../services/useAddVehicle";
import {
  Input,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { IconCar } from "@tabler/icons-react";

interface AddVehicleFormProps {
  onSuccess?: () => void;
}

export const AddVehicleForm = ({ onSuccess }: AddVehicleFormProps) => {
  const makeRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const plateNumberRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { mutate: addVehicle, isPending } = useAddVehicle();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const vehicleData = {
      make: makeRef.current?.value || "",
      model: modelRef.current?.value || "",
      year: Number(yearRef.current?.value) || 0,
      plate: plateNumberRef.current?.value || "",
      imageFile: imageRef.current?.files?.[0],
    };

    addVehicle(vehicleData, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader className="flex gap-3">
        <IconCar className="text-primary w-8 h-8" />
        <div>
          <p className="text-xl font-semibold">Add New Vehicle</p>
          <p className="text-small text-default-500">
            Enter your vehicle details below
          </p>
        </div>
      </ModalHeader>

      <ModalBody className="gap-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Make"
            ref={makeRef}
            isRequired
            placeholder="e.g., Toyota"
            variant="bordered"
            labelPlacement="outside"
            classNames={{
              label: "font-medium",
            }}
          />
          <Input
            label="Model"
            ref={modelRef}
            isRequired
            placeholder="e.g., Camry"
            variant="bordered"
            labelPlacement="outside"
            classNames={{
              label: "font-medium",
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Year"
            ref={yearRef}
            type="number"
            min={1900}
            max={new Date().getFullYear() + 1}
            isRequired
            placeholder="e.g., 2024"
            variant="bordered"
            labelPlacement="outside"
            classNames={{
              label: "font-medium",
            }}
          />
          <Input
            label="Plate Number"
            ref={plateNumberRef}
            isRequired
            placeholder="e.g., ABC-123"
            variant="bordered"
            labelPlacement="outside"
            classNames={{
              label: "font-medium",
            }}
          />
        </div>
        <Input
          type="file"
          label="Vehicle Image"
          ref={imageRef}
          accept="image/*"
          variant="bordered"
          labelPlacement="outside"
          classNames={{
            label: "font-medium",
          }}
          description="Upload a clear photo of your vehicle"
        />
      </ModalBody>

      <ModalFooter>
        <Button variant="light" onPress={onSuccess}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isPending}
          color="primary"
          className="font-medium"
        >
          {isPending ? "Adding Vehicle..." : "Add Vehicle"}
        </Button>
      </ModalFooter>
    </form>
  );
};
