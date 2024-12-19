import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import { TVehicleWithServices } from "../types/vehicle.type";

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const vehicleRef = doc(db, `vehicles/${vehicleId}`);
      await deleteDoc(vehicleRef);
      return vehicleId;
    },
    onSuccess: (vehicleId) => {
      toast.success("Vehicle deleted successfully");
      queryClient.setQueryData<TVehicleWithServices[]>(
        ["vehicles"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((vehicle) => vehicle.id !== vehicleId);
        }
      );
    },
    onError: () => {
      toast.error("Failed to delete vehicle. Please try again.");
    },
  });
} 