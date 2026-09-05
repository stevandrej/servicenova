import { TService } from "../types/service.type";

export interface ServiceWithDelta {
  service: TService;
  /**
   * Kilometres covered since the previous (older) service, or null when there
   * is no older record or the numbers don't increase - a mistyped mileage
   * should show nothing rather than a negative distance.
   */
  mileageDelta: number | null;
}

export interface ServiceYearGroup {
  year: number;
  entries: ServiceWithDelta[];
  totalSpent: number;
}

/**
 * Groups a newest-first service list by year, newest year first, attaching the
 * mileage covered since the previous service.
 *
 * Years come from getUTCFullYear, not getFullYear: dates are stored as
 * UTC-midnight day values (see formatDate.ts), so a 1 January record would fall
 * into the previous year for any viewer west of UTC.
 */
export function groupServicesByYear(services: TService[]): ServiceYearGroup[] {
  const groups = new Map<number, ServiceYearGroup>();

  services.forEach((service, index) => {
    const previous = services[index + 1];
    const delta = previous ? service.mileage - previous.mileage : null;

    const year = service.date.getUTCFullYear();
    let group = groups.get(year);
    if (!group) {
      group = { year, entries: [], totalSpent: 0 };
      groups.set(year, group);
    }

    group.entries.push({
      service,
      mileageDelta: delta !== null && delta > 0 ? delta : null,
    });
    group.totalSpent += service.price || 0;
  });

  return [...groups.values()].sort((a, b) => b.year - a.year);
}
