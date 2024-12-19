import { useMutation } from "@tanstack/react-query";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { queryClient } from "../lib/react-query";
import { toast } from "react-toastify";
import { uploadImage } from "../utils/uploadImage";

interface AddVehicleData {
  make: string;
  model: string;
  year: number;
  plate: string;
  imageFile?: File;
}

async function addVehicle(data: AddVehicleData) {
  let imageUrl = "";
  
  if (data.imageFile) {
    try {
      const fileName = `${Date.now()}-${data.imageFile.name}`;
      imageUrl = await uploadImage(data.imageFile, `images/${fileName}`);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload vehicle image");
    }
  }

  const vehicleData = {
    make: data.make,
    model: data.model,
    year: data.year,
    plate: data.plate,
    imageUrl,
  };

  const vehiclesCollection = collection(db, "vehicles");
  const docRef = await addDoc(vehiclesCollection, vehicleData);

  return {
    id: docRef.id,
    ...vehicleData,
  } as TVehicle;
}

export function useAddVehicle() {
  return useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      toast.success("Vehicle added successfully");
      queryClient.refetchQueries({
        queryKey: vehiclesQueryOptions.queryKey,
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add vehicle");
    },
  });
}
