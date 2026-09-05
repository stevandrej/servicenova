import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle, TVehicleWithServices } from "../types/vehicle.type";
import { TService } from "../types/service.type";
import { firebaseTimestampToDate } from "../utils/formatDate";

async function fetchVehicles(): Promise<TVehicleWithServices[]> {
  // The vehicles collection is deliberately unfiltered - this is a shared
  // family garage, so every signed-in account sees the same fleet.
  const vehiclesCollection = collection(db, "vehicles");
  const vehiclesSnapshot = await getDocs(query(vehiclesCollection));

  const vehicles = vehiclesSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    // The stored value is a fallback only - see the derivation below.
    nextServiceDate: doc.data().nextServiceDate
      ? firebaseTimestampToDate(doc.data().nextServiceDate)
      : null,
  })) as TVehicle[];

  // One read per vehicle, issued in parallel. A collectionGroup("services")
  // query would collapse these into a single read, but the Firestore rules
  // scope services to /vehicles/{id}/services/{id}, and collection-group
  // queries are only allowed by a rule matching /{path=**}/services/{id}.
  const vehiclesWithServices = await Promise.all(
    vehicles.map(async (vehicle): Promise<TVehicleWithServices> => {
      const servicesCollection = collection(
        db,
        `vehicles/${vehicle.id}/services`
      );
      const servicesSnapshot = await getDocs(query(servicesCollection));

      // Built field by field rather than spread: a field missing from this
      // list is silently dropped from every consumer.
      const services = servicesSnapshot.docs.map(
        (doc): TService => ({
          id: doc.id,
          date: firebaseTimestampToDate(doc.data().date),
          mileage: doc.data().mileage,
          price: doc.data().price,
          serviceType: doc.data().serviceType,
          notes: doc.data().notes,
          nextServiceDate: doc.data().nextServiceDate
            ? firebaseTimestampToDate(doc.data().nextServiceDate)
            : null,
        })
      );

      const sorted = services.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      return {
        ...vehicle,
        // The reminder follows the newest service that carries one. Records
        // saved before nextServiceDate moved onto the service document have
        // none, so the vehicle's own stored field is the fallback.
        nextServiceDate:
          sorted[0]?.nextServiceDate ?? vehicle.nextServiceDate ?? null,
        services: sorted,
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
