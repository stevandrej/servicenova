import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicleWithServices } from "../types/vehicle.type";
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
      await deleteDoc(serviceRef);
      return serviceId;
    },
    onSuccess: (_, { vehicleId, serviceId }) => {
      toast.success("Service record deleted successfully");
      queryClient.setQueryData<TVehicleWithServices[]>(
        ["vehicles"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((vehicle) => {
            if (vehicle.id === vehicleId) {
              return {
                ...vehicle,
                services: vehicle.services.filter(
                  (service) => service.id !== serviceId
                ),
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
