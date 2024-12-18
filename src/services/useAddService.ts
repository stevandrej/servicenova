import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { TVehicleWithServices } from "../types/vehicle.type";
import { firebaseTimestampToDate } from "../utils/formatDate";

interface AddServiceParams {
	vehicleId: string;
	service: Omit<TService, "id" | "nextServiceDate" | "date"> & {
		date: Timestamp;
		nextServiceDate: Timestamp | null;
	};
}

export function useAddService() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ vehicleId, service }: AddServiceParams) => {
			const serviceRef = await addDoc(
				collection(db, `vehicles/${vehicleId}/services`),
				service
			);
			return { id: serviceRef.id, ...service };
		},
		onSuccess: (newService, { vehicleId }) => {
			queryClient.setQueryData<TVehicleWithServices>(
				["vehicle", vehicleId],
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						services: [
							{
								...newService,
								date: firebaseTimestampToDate(newService.date),
								nextServiceDate: newService.nextServiceDate
									? firebaseTimestampToDate(
											newService.nextServiceDate
									  )
									: null,
							},
							...oldData.services,
						],
					};
				}
			);
		},
	});
}
