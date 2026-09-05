import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { TVehicleWithServices } from "../types/vehicle.type";
import { firebaseTimestampToDate } from "../utils/formatDate";
import { savedToast, settleLocally } from "./settleLocally";
import { isNewestService } from "./isNewestService";
import { toast } from "react-toastify";

interface AddServiceParams {
  vehicleId: string;
  service: Omit<TService, "id" | "date" | "nextServiceDate"> & {
    date: Timestamp;
    nextServiceDate: Timestamp | null;
  };
}

export function useAddService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, service }: AddServiceParams) => {
      // The id is minted client-side rather than taken from addDoc's resolved
      // reference: addDoc only resolves on the server ack, which never comes
      // offline. doc() on a collection generates the id locally.
      const serviceRef = doc(collection(db, `vehicles/${vehicleId}/services`));

      // The vehicle's denormalized reminder only follows the newest record, so
      // backdating a forgotten service cannot rewrite when the car is next due.
      const isNewest = isNewestService(
        queryClient,
        vehicleId,
        null,
        service.date.toDate()
      );

      const writes: Promise<unknown>[] = [setDoc(serviceRef, service)];
      if (isNewest) {
        writes.push(
          updateDoc(doc(db, `vehicles/${vehicleId}`), {
            nextServiceDate: service.nextServiceDate,
          })
        );
      }

      return settleLocally(
        { id: serviceRef.id, isNewest, ...service },
        Promise.all(writes)
      );
    },
    onSuccess: (newService, { vehicleId }) => {
      savedToast("Service record added successfully");

      const nextServiceDate = newService.nextServiceDate
        ? firebaseTimestampToDate(newService.nextServiceDate)
        : null;

      queryClient.setQueryData<TVehicleWithServices[]>(
        ["vehicles"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((vehicle) => {
            if (vehicle.id === vehicleId) {
              return {
                ...vehicle,
                nextServiceDate: newService.isNewest
                  ? nextServiceDate
                  : vehicle.nextServiceDate,
                // Kept newest-first: a backdated record must not be treated
                // as the latest service by anything reading services[0].
                services: [
                  {
                    id: newService.id,
                    date: firebaseTimestampToDate(newService.date),
                    mileage: newService.mileage,
                    price: newService.price,
                    serviceType: newService.serviceType,
                    notes: newService.notes,
                    nextServiceDate,
                  },
                  ...vehicle.services,
                ].sort((a, b) => b.date.getTime() - a.date.getTime()),
              };
            }
            return vehicle;
          });
        }
      );
    },
    onError: () => {
      toast.error("Failed to add service record. Please try again.");
    },
  });
}
