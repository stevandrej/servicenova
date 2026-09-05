import { useMemo } from "react";
import { Accordion, AccordionItem, Button, Divider } from "@nextui-org/react";
import { TService } from "../../../types/service.type";
import { groupServicesByYear } from "../../../utils/groupServices";
import { formatCurrency } from "../../../utils/formatCurrency";
import { ServiceRowBody } from "./service-row";
import { serviceRowProps } from "./service-row-header";

interface ServiceHistoryProps {
  services: TService[];
  vehicleId: string;
  onAddService: () => void;
  onEditService: (service: TService) => void;
}

export const ServiceHistory = ({
  services,
  vehicleId,
  onAddService,
  onEditService,
}: ServiceHistoryProps) => {
  const groups = useMemo(() => groupServicesByYear(services), [services]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Service History</h2>

      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No service records found</p>
          <Button
            color="primary"
            variant="light"
            onPress={onAddService}
            className="mt-2"
          >
            Add First Service Record
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.year}>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-medium font-semibold tabular-nums">
                  {group.year}
                </h3>
                <Divider className="flex-1" />
                <p className="text-small text-default-500 tabular-nums whitespace-nowrap">
                  {group.entries.length} service
                  {group.entries.length === 1 ? "" : "s"} ·{" "}
                  {formatCurrency(group.totalSpent)}
                </p>
              </div>

              <Accordion
                selectionMode="multiple"
                variant="light"
                showDivider={false}
                itemClasses={{
                  base: "border-b border-default-100 last:border-b-0",
                  trigger: "py-3 gap-3",
                  title: "text-medium",
                  content: "pt-0 pb-4",
                }}
              >
                {/* AccordionItem must be a direct child of Accordion -
                    react-stately's collection builder rejects wrappers. */}
                {group.entries.map(({ service, mileageDelta }) => (
                  <AccordionItem
                    key={service.id}
                    {...serviceRowProps(service, mileageDelta)}
                  >
                    <ServiceRowBody
                      vehicleId={vehicleId}
                      service={service}
                      onEdit={() => onEditService(service)}
                    />
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
