import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { toast } from "react-toastify";
import { queryClient } from "../lib/react-query";

interface UpdateVehicleData {
	id: string;
	make: string;
	model: string;
	year: number;
	plate: string;
	imageUrl: string;
}

async function updateVehicle(data: UpdateVehicleData) {
	const vehicleData = {
		make: data.make,
		model: data.model,
		year: data.year,
		plate: data.plate,
		imageUrl: data.imageUrl,
	};

	const vehicleRef = doc(db, "vehicles", data.id);
	await updateDoc(vehicleRef, vehicleData);

	return {
		id: data.id,
		...vehicleData,
	} as TVehicle;
}

export function useUpdateVehicle() {
	return useMutation({
		mutationFn: updateVehicle,
		onSuccess: () => {
			toast.success("Vehicle updated successfully");
			queryClient.refetchQueries({
				queryKey: vehiclesQueryOptions.queryKey,
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update vehicle"
			);
		},
	});
}
