import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicleWithServices } from "../types/vehicle.type";
import { savedToast, settleLocally } from "./settleLocally";
import { toast } from "react-toastify";

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
      const serviceRef = doc(db, `vehicles/${vehicleId}/services/${serviceId}`);
      return settleLocally(serviceId, deleteDoc(serviceRef));
    },
    onSuccess: (_, { vehicleId, serviceId }) => {
      savedToast("Service record deleted successfully");
      queryClient.setQueryData<TVehicleWithServices[]>(
        ["vehicles"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((vehicle) => {
            if (vehicle.id === vehicleId) {
              const services = vehicle.services.filter(
                (service) => service.id !== serviceId
              );
              return {
                ...vehicle,
                // Deleting the newest record used to leave the vehicle's
                // reminder pointing at a service that no longer exists.
                nextServiceDate: services[0]?.nextServiceDate ?? null,
                services,
              };
            }
            return vehicle;
          });
        }
      );
    },
    onError: () => {
      toast.error("Failed to delete service record. Please try again.");
    },
  });
}
