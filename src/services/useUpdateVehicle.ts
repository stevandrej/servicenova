import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { toast } from "react-toastify";
import { uploadImage } from "../utils/uploadImage";
import { queryClient } from "../lib/react-query";

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
    // Delete old image if exists
    if (data.currentImageUrl) {
      try {
        const oldImageRef = ref(storage, data.currentImageUrl);
        await deleteObject(oldImageRef);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Upload new image
    try {
      const fileName = `${Date.now()}-${data.imageFile.name}`;
      imageUrl = await uploadImage(data.imageFile, `vehicles/${fileName}`);
    } catch (error) {
      console.error("Error uploading new image:", error);
      throw new Error("Failed to upload vehicle image");
    }
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
  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      queryClient.refetchQueries({
        queryKey: vehiclesQueryOptions.queryKey,
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update vehicle");
    },
  });
} 