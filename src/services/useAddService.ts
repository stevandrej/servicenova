import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { TVehicleWithServices } from "../types/vehicle.type";

interface AddServiceParams {
  vehicleId: string;
  service: Omit<TService, "id">;
}

export function useAddService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, service }: AddServiceParams) => {
      const serviceRef = await addDoc(
        collection(db, `vehicles/${vehicleId}/services`),
        service
      );
      return { id: serviceRef.id, ...service };
    },
    onSuccess: (newService, { vehicleId }) => {
      // Update vehicles list cache
      queryClient.setQueryData<TVehicleWithServices[]>(["vehicles"], (oldData) => {
        if (!oldData) return oldData;
        
        return oldData.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              services: [newService, ...vehicle.services]
            };
          }
          return vehicle;
        });
      });

      // Update single vehicle cache
      queryClient.setQueryData<TVehicleWithServices>(["vehicle", vehicleId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          services: [newService, ...oldData.services]
        };
      });
    },
  });
} 