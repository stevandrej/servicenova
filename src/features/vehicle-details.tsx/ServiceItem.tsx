import { memo } from "react";
import { TService } from "../../types/service.type";
import { formatDate } from "../../utils/formatDate";

interface ServiceItemProps {
  service: TService;
}

export const ServiceItem = memo(({ service }: ServiceItemProps) => (
  <div>
    <ul>
      <li>{formatDate(service.date)}</li>
      <li>{service.serviceType}</li>
      <li>{service.mileage}</li>
      <li>{service.price}</li>
      <li>{service.notes}</li>
    </ul>
  </div>
));

ServiceItem.displayName = "ServiceItem";
