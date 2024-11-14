import { queryOptions, useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";

async function fetchVehicles() {
  try {
    const vehiclesCollection = collection(db, "vehicles");
    const snapshot = await getDocs(vehiclesCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TVehicle[];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw new Error("Failed to fetch vehicles. Please try again later.");
  }
}

export const vehiclesQueryOptions = queryOptions({
  queryKey: ["vehicles"] as const,
  queryFn: fetchVehicles,
});

export function useFetchVehicles() {
  return useQuery(vehiclesQueryOptions);
}
