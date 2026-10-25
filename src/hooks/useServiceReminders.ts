import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { vehiclesQueryOptions } from "../services/useFetchVehicles";
import { runServiceReminders } from "../services/notifications";

/**
 * Fires due-service notifications and refreshes the app badge. It reads the
 * ["vehicles"] cache rather than issuing its own query, so it adds no second
 * read path for data the app already has.
 */
export function useServiceReminders() {
  const { data: vehicles } = useQuery(vehiclesQueryOptions);

  useEffect(() => {
    if (!vehicles) return;
    runServiceReminders(vehicles);
  }, [vehicles]);
}
