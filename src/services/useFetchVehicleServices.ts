import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const fetchVehicleServices = async (vehicleId: string) => {
  try {
    const vehicleServicesCollection = collection(
      db,
      `vehicles/${vehicleId}/services`
    );

    const snapshot = await getDocs(vehicleServicesCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TService[];
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
