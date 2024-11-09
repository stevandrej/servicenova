import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

async function fetchCars() {
  try {
    const vehiclesCollection = collection(db, "vehicles");
    const snapshot = await getDocs(vehiclesCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function useCars(enabled: boolean) {
  return useQuery({
    queryKey: ["cars"],
    queryFn: fetchCars,
    enabled,
  });
} 