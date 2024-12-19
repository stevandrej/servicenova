import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { TVehicleWithServices } from "../types/vehicle.type";
import { firebaseTimestampToDate } from "../utils/formatDate";
import { toast } from "react-toastify";

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
      const vehicleRef = doc(db, `vehicles/${vehicleId}`);
      await updateDoc(vehicleRef, {
        nextServiceDate: service.nextServiceDate,
      });
      return { id: serviceRef.id, ...service };
    },
    onSuccess: (newService, { vehicleId }) => {
      toast.success("Service record added successfully");

      queryClient.setQueryData<TVehicleWithServices[]>(
        ["vehicles"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((vehicle) => {
            if (vehicle.id === vehicleId) {
              return {
                ...vehicle,
                nextServiceDate: newService.nextServiceDate
                  ? firebaseTimestampToDate(newService.nextServiceDate)
                  : null,
                services: [
                  {
                    id: newService.id,
                    date: firebaseTimestampToDate(newService.date),
                    mileage: newService.mileage,
                    price: newService.price,
                    serviceType: newService.serviceType,
                    notes: newService.notes,
                  },
                  ...vehicle.services,
                ],
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
