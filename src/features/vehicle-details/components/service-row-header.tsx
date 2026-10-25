import { TService } from "../../../types/service.type";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDayMonth } from "../../../utils/formatDate";
import { getServiceTypeIcon } from "../../../utils/serviceTypes";

/**
 * The header props for one service's AccordionItem.
 *
 * This is a plain function rather than a component that renders AccordionItem
 * itself: NextUI's Accordion is built on react-stately's collection API, which
 * walks its children looking for `type.getCollectionNode` and throws
 * "Unknown element <X> in collection" for anything else. AccordionItem has to
 * stay a *direct* child of Accordion, so only its props are assembled here.
 */
export function serviceRowProps(service: TService, mileageDelta: number | null) {
  const Icon = getServiceTypeIcon(service.serviceType);

  return {
    "aria-label": `${service.serviceType}, ${formatDayMonth(service.date)}`,
    startContent: (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-default-100 text-default-600 flex-shrink-0">
        <Icon size={18} />
      </span>
    ),
    title: (
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-3 min-w-0">
          <span className="text-small tabular-nums text-default-500 flex-shrink-0">
            {formatDayMonth(service.date)}
          </span>
          <span className="font-medium truncate">{service.serviceType}</span>
        </span>
        <span className="font-semibold tabular-nums flex-shrink-0">
          {formatCurrency(service.price)}
        </span>
      </div>
    ),
    subtitle: (
      <span className="text-small text-default-500 tabular-nums">
        {service.mileage.toLocaleString("en-GB")} km
        {mileageDelta !== null && (
          <> · +{mileageDelta.toLocaleString("en-GB")} km</>
        )}
      </span>
    ),
  };
}
