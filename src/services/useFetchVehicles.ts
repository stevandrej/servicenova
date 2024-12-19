import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle, TVehicleWithServices } from "../types/vehicle.type";
import { TService } from "../types/service.type";
import { firebaseTimestampToDate } from "../utils/formatDate";

async function fetchVehicles(): Promise<TVehicleWithServices[]> {
  const vehiclesCollection = collection(db, "vehicles");
  const vehiclesSnapshot = await getDocs(query(vehiclesCollection));

  const vehicles = vehiclesSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    nextServiceDate: doc.data().nextServiceDate
      ? firebaseTimestampToDate(doc.data().nextServiceDate)
      : null,
  })) as TVehicle[];

  const vehiclesWithServices = await Promise.all(
    vehicles.map(async (vehicle): Promise<TVehicleWithServices> => {
      const servicesCollection = collection(
        db,
        `vehicles/${vehicle.id}/services`
      );
      const servicesSnapshot = await getDocs(query(servicesCollection));

      const services = servicesSnapshot.docs.map(
        (doc): TService => ({
          id: doc.id,
          date: firebaseTimestampToDate(doc.data().date),
          mileage: doc.data().mileage,
          price: doc.data().price,
          serviceType: doc.data().serviceType,
          notes: doc.data().notes,
        })
      );

      return {
        ...vehicle,
        services: services.sort((a, b) => b.date.getTime() - a.date.getTime()),
      };
    })
  );

  return vehiclesWithServices;
}

export const vehiclesQueryOptions = {
  queryKey: ["vehicles"] as const,
  queryFn: fetchVehicles,
};

export type VehiclesQuery = typeof vehiclesQueryOptions;
