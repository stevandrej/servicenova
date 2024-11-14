import { memo, useMemo } from "react";
import type { TVehicleWithServices } from "../../types/vehicle.type";
import { formatDate } from "../../utils/formatDate";
import { Timeline } from "../timeline/Timeline";
import { ServiceItem } from "./ServiceItem";

interface VehicleDetailsProps {
  vehicle: TVehicleWithServices;
}

export const VehicleDetails = memo(({ vehicle }: VehicleDetailsProps) => {
  const timelineData = useMemo(
    () =>
      vehicle.services.map((service) => ({
        title: formatDate(service.date),
        content: <ServiceItem service={service} />,
      })),
    [vehicle.services]
  );

  return <Timeline data={timelineData} />;
});

VehicleDetails.displayName = "VehicleDetails";