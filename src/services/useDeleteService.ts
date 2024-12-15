import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const serviceRef = doc(db, `services/${serviceId}`);
      await deleteDoc(serviceRef);
      return serviceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicleServices"],
      });
    },
  });
} 