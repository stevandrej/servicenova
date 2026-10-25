import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TService } from "../types/service.type";
import { savedToast, settleLocally } from "./settleLocally";
import { isNewestService } from "./isNewestService";
import { toast } from "react-toastify";

interface UpdateServiceParams {
  vehicleId: string;
  service: Omit<TService, "date" | "nextServiceDate"> & {
    date: Timestamp;
    nextServiceDate: Timestamp | null;
  };
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, service }: UpdateServiceParams) => {
      const { id, ...serviceData } = service;

      // nextServiceDate is written onto the service record itself. It used to
      // be stripped here and pushed only to the vehicle, which is why saving
      // any old record silently reset the vehicle's live reminder.
      const writes: Promise<unknown>[] = [
        updateDoc(doc(db, `vehicles/${vehicleId}/services/${id}`), serviceData),
      ];

      if (isNewestService(queryClient, vehicleId, id, service.date.toDate())) {
        writes.push(
          updateDoc(doc(db, `vehicles/${vehicleId}`), {
            nextServiceDate: service.nextServiceDate,
          })
        );
      }

      return settleLocally(service, Promise.all(writes));
    },
    onSuccess: () => {
      savedToast("Service record updated successfully");
      queryClient.refetchQueries({
        queryKey: ["vehicles"],
      });
    },
    onError: () => {
      toast.error("Failed to update service record. Please try again.");
    },
  });
}
