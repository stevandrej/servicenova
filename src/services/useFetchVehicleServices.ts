import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { firebaseTimestampToDate } from "../utils/formatDate";

export const fetchVehicleServices = async (vehicleId: string) => {
	try {
		const vehicleServicesCollection = collection(
			db,
			`vehicles/${vehicleId}/services`
		);

		const snapshot = await getDocs(vehicleServicesCollection);

		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				id: doc.id,
				date: firebaseTimestampToDate(data.date),
			};
		}) as TService[];
	} catch (error) {
		console.error("Error fetching vehicle services:", error);
		throw new Error(
			"Failed to fetch vehicle services. Please try again later."
		);
	}
};

export const vehicleServicesQueryOptions = (vehicleId: string) =>
	queryOptions({
		queryKey: ["vehicleServices", vehicleId] as const,
		queryFn: () => fetchVehicleServices(vehicleId),
	});

export function useFetchVehicleServices(vehicleId: string) {
	return useQuery(vehicleServicesQueryOptions(vehicleId));
}
