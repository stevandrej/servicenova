import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";

interface UpdateServiceParams {
  serviceId: string;
  service: Omit<TService, "id">;
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, service }: UpdateServiceParams) => {
      const serviceRef = doc(db, `services/${serviceId}`);
      await updateDoc(serviceRef, service);
      return { id: serviceId, ...service };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicleServices"],
      });
    },
  });
} 