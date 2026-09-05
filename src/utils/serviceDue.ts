import { TVehicleWithServices } from "../types/vehicle.type";

/** A next service inside this window counts as due soon. */
export const DUE_SOON_DAYS = 30;

/** Next service further out than this is comfortably in the future. */
export const UPCOMING_DAYS = 90;

/**
 * A vehicle that has not been serviced in roughly ten months needs a look even
 * if no next-service date was ever set.
 */
export const STALE_SERVICE_DAYS = 320;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type ServiceUrgency =
  | "none" // no next service scheduled
  | "overdue"
  | "due-soon"
  | "upcoming"
  | "ok";

/** Whole days from today until `date`; negative once the date has passed. */
export function daysUntil(date: Date): number {
  return Math.floor((date.getTime() - Date.now()) / MS_PER_DAY);
}

/** Whole days since `date`. */
export function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

export function getServiceUrgency(
  nextServiceDate?: Date | null
): ServiceUrgency {
  if (!nextServiceDate) return "none";

  const days = daysUntil(new Date(nextServiceDate));
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due-soon";
  if (days <= UPCOMING_DAYS) return "upcoming";
  return "ok";
}

/** Vehicles whose next service has passed or falls inside DUE_SOON_DAYS. */
export function getVehiclesDue<T extends { nextServiceDate?: Date | null }>(
  vehicles: T[]
): T[] {
  return vehicles.filter((vehicle) => {
    const urgency = getServiceUrgency(vehicle.nextServiceDate);
    return urgency === "overdue" || urgency === "due-soon";
  });
}

/**
 * Vehicles worth surfacing on the dashboard: never serviced, not serviced in a
 * long time, or with a next service that is due or past. Most urgent first.
 */
export function getVehiclesNeedingAttention(
  vehicles: TVehicleWithServices[]
): TVehicleWithServices[] {
  const rank: Record<ServiceUrgency, number> = {
    overdue: 0,
    "due-soon": 1,
    none: 2,
    upcoming: 3,
    ok: 4,
  };

  return vehicles
    .filter((vehicle) => {
      // services are stored newest-first
      const lastService = vehicle.services?.[0];
      if (!lastService) return true;

      const urgency = getServiceUrgency(vehicle.nextServiceDate);
      return (
        daysSince(lastService.date) > STALE_SERVICE_DAYS ||
        urgency === "overdue" ||
        urgency === "due-soon"
      );
    })
    .sort((a, b) => {
      const byUrgency =
        rank[getServiceUrgency(a.nextServiceDate)] -
        rank[getServiceUrgency(b.nextServiceDate)];
      if (byUrgency !== 0) return byUrgency;

      // Then oldest last service first; never-serviced sorts to the top.
      const aLast = a.services?.[0]?.date.getTime() ?? 0;
      const bLast = b.services?.[0]?.date.getTime() ?? 0;
      return aLast - bLast;
    });
}
