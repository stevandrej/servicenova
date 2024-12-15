import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { useAddVehicle } from "../../services/useAddVehicle";
import { Input, Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { IconCar } from "@tabler/icons-react";

export const AddVehicleForm = () => {
  const makeRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const plateNumberRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
        toast.success("Vehicle added successfully!");
        navigate({ to: "/vehicles" });
      },
      onError: (error) => {
        console.error("Error adding vehicle:", error);
        toast.error("Failed to add vehicle. Please try again.");
      },
    });
  };

  return (
    <div className="flex justify-center items-start min-h-[80vh] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex gap-3 p-6 bg-gradient-to-r from-primary-900 to-primary-800">
          <IconCar className="text-white w-8 h-8" />
          <div className="flex flex-col">
            <p className="text-xl text-white font-semibold">Add New Vehicle</p>
            <p className="text-small text-white/60">
              Enter your vehicle details below
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            <div>
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
                description="Upload a photo of your vehicle"
              />
            </div>
            <Button
              type="submit"
              isLoading={isPending}
              color="primary"
              size="lg"
              className="w-full mt-4 font-medium"
            >
              {isPending ? "Adding Vehicle..." : "Add Vehicle"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
