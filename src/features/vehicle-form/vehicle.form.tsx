import { useRef, useEffect } from "react";
import { useAddVehicle } from "../../services/useAddVehicle";
import { useUpdateVehicle } from "../../services/useUpdateVehicle";
import {
	Input,
	Button,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@nextui-org/react";
import { IconCar } from "@tabler/icons-react";
import { TVehicle } from "../../types/vehicle.type";

interface VehicleFormProps {
	mode: "add" | "edit";
	vehicle?: TVehicle;
	onSuccess?: () => void;
}

export const VehicleForm = ({ mode, vehicle, onSuccess }: VehicleFormProps) => {
	const makeRef = useRef<HTMLInputElement>(null);
	const modelRef = useRef<HTMLInputElement>(null);
	const yearRef = useRef<HTMLInputElement>(null);
	const plateNumberRef = useRef<HTMLInputElement>(null);
	const imageRef = useRef<HTMLInputElement>(null);

	const { mutate: addVehicle, isPending: isAdding } = useAddVehicle();
	const { mutate: updateVehicle, isPending: isUpdating } = useUpdateVehicle();

	useEffect(() => {
		if (mode === "edit" && vehicle) {
			if (makeRef.current) makeRef.current.value = vehicle.make;
			if (modelRef.current) modelRef.current.value = vehicle.model;
			if (yearRef.current)
				yearRef.current.value = vehicle.year.toString();
			if (imageRef.current)
				imageRef.current.value = vehicle.imageUrl || "";
			if (plateNumberRef.current)
				plateNumberRef.current.value = vehicle.plate;
		}
	}, [mode, vehicle]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = {
			make: makeRef.current?.value ?? "",
			model: modelRef.current?.value ?? "",
			year: Number(yearRef.current?.value) || 0,
			plate: plateNumberRef.current?.value ?? "",
			imageUrl: imageRef.current?.value ?? "",
		};

		if (mode === "add") {
			addVehicle(formData, {
				onSuccess: () => {
					onSuccess?.();
				},
			});
		} else {
			updateVehicle(
				{
					...formData,
					id: vehicle!.id,
				},
				{
					onSuccess: () => {
						onSuccess?.();
					},
				}
			);
		}
	};

	const isPending = mode === "add" ? isAdding : isUpdating;
	const title = mode === "add" ? "Add New Vehicle" : "Edit Vehicle";
	const description =
		mode === "add"
			? "Enter your vehicle details below"
			: "Update your vehicle details below";
	const submitText =
		mode === "add"
			? isPending
				? "Adding Vehicle..."
				: "Add Vehicle"
			: isPending
			? "Updating Vehicle..."
			: "Update Vehicle";

	return (
		<form onSubmit={handleSubmit}>
			<ModalHeader className="flex gap-3">
				<IconCar className="text-primary w-8 h-8" />
				<div>
					<p className="text-xl font-semibold">{title}</p>
					<p className="text-small text-default-500">{description}</p>
				</div>
			</ModalHeader>

			<ModalBody className="gap-4 py-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						label="Make"
						ref={makeRef}
						defaultValue={vehicle?.make}
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
						defaultValue={vehicle?.model}
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
						defaultValue={vehicle?.year?.toString()}
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
						defaultValue={vehicle?.plate}
						isRequired
						placeholder="e.g., ABC-123"
						variant="bordered"
						labelPlacement="outside"
						classNames={{
							label: "font-medium",
						}}
					/>
				</div>
				{mode === "edit" && vehicle?.imageUrl && (
					<div className="mb-2">
						<p className="text-sm text-gray-500 mb-2">
							Current Image:
						</p>
						<img
							src={vehicle.imageUrl}
							alt="Current vehicle"
							className="w-full max-w-[200px] h-auto rounded-lg"
						/>
					</div>
				)}
				<Input
					label={
						mode === "add"
							? "Vehicle Image"
							: "Update Vehicle Image"
					}
					ref={imageRef}
					defaultValue={vehicle?.imageUrl}
					variant="bordered"
					placeholder="e.g. https://example.com/image.jpg"
					labelPlacement="outside"
					classNames={{
						label: "font-medium",
					}}
					description="Enter the URL of the vehicle image"
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
					{submitText}
				</Button>
			</ModalFooter>
		</form>
	);
};
