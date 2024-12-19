import { useMutation } from "@tanstack/react-query";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { queryClient } from "../lib/react-query";
import { toast } from "react-toastify";

interface AddVehicleData {
	make: string;
	model: string;
	year: number;
	plate: string;
	imageUrl?: string;
}

async function addVehicle(data: AddVehicleData) {
	const vehicleData = {
		make: data.make,
		model: data.model,
		year: data.year,
		plate: data.plate,
		imageUrl: data.imageUrl,
	};

	const vehiclesCollection = collection(db, "vehicles");
	const docRef = await addDoc(vehiclesCollection, vehicleData);

	return {
		id: docRef.id,
		...vehicleData,
	} as TVehicle;
}

export function useAddVehicle() {
	return useMutation({
		mutationFn: addVehicle,
		onSuccess: () => {
			toast.success("Vehicle added successfully");
			queryClient.refetchQueries({
				queryKey: vehiclesQueryOptions.queryKey,
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to add vehicle"
			);
		},
	});
}
