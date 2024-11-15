import { useRef } from "react";
import { ShimmerButton } from "../../components/buttons/ShimmerButton";
import { Input } from "../../components/input/Input";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { useAddVehicle } from "../../services/useAddVehicle";

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
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <Input label="Make" ref={makeRef} required />
        <Input label="Model" ref={modelRef} required />
        <Input
          label="Year"
          ref={yearRef}
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          required
        />
        <Input label="Plate Number" ref={plateNumberRef} required />
        <Input
          type="file"
          label="Vehicle Image"
          ref={imageRef}
          accept="image/*"
        />
        <ShimmerButton type="submit" disabled={isPending}>
          {isPending ? "Adding Vehicle..." : "Add Vehicle"}
        </ShimmerButton>
      </div>
    </form>
  );
};
