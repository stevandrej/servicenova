import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  isPending?: boolean;
}

/**
 * Replaces the native confirm(), which blocks the whole tab, cannot be styled,
 * and in an installed standalone PWA reads as a browser error rather than part
 * of the app.
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Delete",
  isPending = false,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" placement="center">
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="text-default-600">{body}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="danger" onPress={onConfirm} isLoading={isPending}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
