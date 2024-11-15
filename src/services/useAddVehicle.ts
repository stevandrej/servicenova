import { useMutation } from "@tanstack/react-query";
import { collection, addDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { TVehicle } from "../types/vehicle.type";
import { vehiclesQueryOptions } from "./useFetchVehicles";
import { queryClient } from "../lib/react-query";

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
    const storageRef = ref(storage, `vehicles/${data.imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, data.imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
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
      queryClient.invalidateQueries({
        queryKey: vehiclesQueryOptions.queryKey,
      });
    },
  });
}
