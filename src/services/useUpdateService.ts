import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { toast } from "react-toastify";

interface UpdateServiceParams {
  vehicleId: string;
  service: Omit<TService, "nextServiceDate" | "date"> & {
    date: Timestamp;
    nextServiceDate: Timestamp | null;
  };
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, service }: UpdateServiceParams) => {
      const serviceRef = doc(
        db,
        `vehicles/${vehicleId}/services/${service.id}`
      );
      await updateDoc(serviceRef, service);
      return { ...service };
    },
    onSuccess: () => {
      toast.success("Service record updated successfully");
      queryClient.refetchQueries({
        queryKey: ["vehicles"],
      });
    },
    onError: () => {
      toast.error("Failed to update service record. Please try again.");
    },
  });
}
