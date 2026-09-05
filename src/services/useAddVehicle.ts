import { useMutation } from "@tanstack/react-query";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { queryClient } from "../lib/react-query";
import { savedToast, settleLocally } from "./settleLocally";
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

	// The id is minted client-side rather than taken from addDoc's resolved
	// reference: addDoc only resolves on the server ack, which never comes
	// offline. doc() on a collection generates the id locally.
	const vehicleRef = doc(collection(db, "vehicles"));

	return settleLocally(
		{ id: vehicleRef.id, ...vehicleData } as TVehicle,
		setDoc(vehicleRef, vehicleData)
	);
}

export function useAddVehicle() {
	return useMutation({
		mutationFn: addVehicle,
		onSuccess: () => {
			savedToast("Vehicle added successfully");
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
