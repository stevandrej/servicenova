import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle, TVehicleWithServices } from "../types/vehicle.type";
import { TService } from "../types/service.type";

async function fetchVehicles(): Promise<TVehicleWithServices[]> {
  const vehiclesCollection = collection(db, "vehicles");
  const vehiclesSnapshot = await getDocs(query(vehiclesCollection));
  
  const vehicles = vehiclesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TVehicle[];

  // Fetch services for each vehicle
  const vehiclesWithServices = await Promise.all(
    vehicles.map(async (vehicle) => {
      const servicesCollection = collection(db, `vehicles/${vehicle.id}/services`);
      const servicesSnapshot = await getDocs(query(servicesCollection));
      
      const services = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(), // Convert Firestore Timestamp to Date
      })) as TService[];

      return {
        ...vehicle,
        services: services.sort((a, b) => b.date.getTime() - a.date.getTime()),
      };
    })
  );

  return vehiclesWithServices;
}

export const vehiclesQueryOptions = {
  queryKey: ['vehicles'] as const,
  queryFn: fetchVehicles,
};

export type VehiclesQuery = typeof vehiclesQueryOptions;
