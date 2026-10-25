import { memo } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { TService } from "../../../types/service.type";
import { useDeleteService } from "../../../services/useDeleteService";
import { ConfirmDialog } from "../../../components/confirm-dialog";

interface ServiceRowBodyProps {
  vehicleId: string;
  service: TService;
  onEdit: () => void;
}

/**
 * The expanded half of a row. The actions live here rather than in the header
 * because an AccordionItem's header *is* a button - nesting buttons inside it
 * would be invalid markup and every click would toggle the row.
 */
export const ServiceRowBody = memo(
  ({ vehicleId, service, onEdit }: ServiceRowBodyProps) => {
    const { mutate: deleteService, isPending } = useDeleteService();
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <div className="flex flex-col gap-3 pb-1">
        {service.notes ? (
          <p className="text-small text-default-600 whitespace-pre-line">
            {service.notes}
          </p>
        ) : (
          <p className="text-small text-default-400 italic">No notes</p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<IconEdit size={16} />}
            onPress={onEdit}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            startContent={<IconTrash size={16} />}
            onPress={onOpen}
          >
            Delete
          </Button>
        </div>

        <ConfirmDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={() => {
            deleteService({ vehicleId, serviceId: service.id });
            onClose();
          }}
          title="Delete service record?"
          body={`The "${service.serviceType}" record will be permanently deleted. This cannot be undone.`}
          isPending={isPending}
        />
      </div>
    );
  }
);

ServiceRowBody.displayName = "ServiceRowBody";
