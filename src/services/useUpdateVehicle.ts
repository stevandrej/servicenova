import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { toast } from "react-toastify";

interface UpdateVehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  imageFile?: File;
  currentImageUrl?: string;
}

async function updateVehicle(data: UpdateVehicleData) {
  let imageUrl = data.currentImageUrl;

  if (data.imageFile) {
    if (data.currentImageUrl) {
      try {
        const oldImageRef = ref(storage, data.currentImageUrl);
        await deleteObject(oldImageRef);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    const storageRef = ref(storage, `vehicles/${data.imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, data.imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const vehicleData = {
    make: data.make,
    model: data.model,
    year: data.year,
    plate: data.plate,
    ...(imageUrl && { imageUrl }),
  };

  const vehicleRef = doc(db, "vehicles", data.id);
  await updateDoc(vehicleRef, vehicleData);

  return {
    id: data.id,
    ...vehicleData,
  } as TVehicle;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      queryClient.refetchQueries({
        queryKey: vehiclesQueryOptions.queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to update vehicle. Please try again.");
    },
  });
} 