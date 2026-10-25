import { QueryClient } from "@tanstack/react-query";
import { TVehicleWithServices } from "../types/vehicle.type";

/**
 * Whether a saved service is the vehicle's most recent one, and therefore the
 * one whose next-service date the vehicle's denormalized copy should follow.
 *
 * Reads the ["vehicles"] cache rather than Firestore - it is the app's single
 * source of truth and is already loaded wherever a service can be saved.
 * `serviceId` is excluded so an edit compares against the *other* records.
 */
export function isNewestService(
  queryClient: QueryClient,
  vehicleId: string,
  serviceId: string | null,
  date: Date
): boolean {
  const vehicles = queryClient.getQueryData<TVehicleWithServices[]>([
    "vehicles",
  ]);
  const others =
    vehicles
      ?.find((vehicle) => vehicle.id === vehicleId)
      ?.services.filter((service) => service.id !== serviceId) ?? [];

  return others.every((service) => service.date.getTime() <= date.getTime());
}
