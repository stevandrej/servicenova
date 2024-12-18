import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";

export function useDeleteService() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			vehicleId,
			serviceId,
		}: {
			vehicleId: string;
			serviceId: string;
		}) => {
			const serviceRef = doc(
				db,
				`vehicles/${vehicleId}/services/${serviceId}`
			);
			await deleteDoc(serviceRef);
			return serviceId;
		},
		onSuccess: (_, { vehicleId, serviceId }) => {
			queryClient.setQueryData<TService[]>(
				["vehicleServices", vehicleId],
				(oldData) => {
					return oldData?.filter(
						(service) => service.id !== serviceId
					);
				}
			);
		},
	});
}
