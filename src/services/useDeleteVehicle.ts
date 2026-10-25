import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../config/firebase";
import { savedToast, settleLocally } from "./settleLocally";
import { toast } from "react-toastify";
import { TVehicleWithServices } from "../types/vehicle.type";

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      // Firestore does not cascade, so the services subcollection has to be
      // cleared explicitly or its documents are orphaned in the database.
      // This read is served from the local cache when offline.
      const servicesSnapshot = await getDocs(
        collection(db, `vehicles/${vehicleId}/services`)
      );

      // A write batch caps out at 500 operations. The commits are collected
      // rather than awaited one by one: each only settles on the server ack,
      // which never arrives offline.
      const acks: Promise<unknown>[] = [];
      for (let i = 0; i < servicesSnapshot.docs.length; i += 500) {
        const batch = writeBatch(db);
        servicesSnapshot.docs
          .slice(i, i + 500)
          .forEach((serviceDoc) => batch.delete(serviceDoc.ref));
        acks.push(batch.commit());
      }

      const vehicleRef = doc(db, `vehicles/${vehicleId}`);
      acks.push(deleteDoc(vehicleRef));

      return settleLocally(vehicleId, Promise.all(acks));
    },
    onSuccess: (vehicleId) => {
      savedToast("Vehicle deleted successfully");
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
