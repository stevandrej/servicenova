import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

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
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["vehicleServices"],
			});
		},
	});
}
