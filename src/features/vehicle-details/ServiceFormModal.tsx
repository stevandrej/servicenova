import { useEffect, useRef, useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Textarea,
	CalendarDate,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { TService } from "../../types/service.type";
import { useAddService } from "../../services/useAddService";
import { useUpdateService } from "../../services/useUpdateService";
import { parseDate } from "@internationalized/date";
import { dateToFirebaseTimestamp } from "../../utils/formatDate";

interface ServiceFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "add" | "edit";
	service?: TService | null;
	vehicleId: string;
	nextService?: Date | null;
}

export const ServiceFormModal = ({
	isOpen,
	onClose,
	mode,
	service,
	vehicleId,
	nextService,
}: ServiceFormModalProps) => {
	const [date, setDate] = useState<CalendarDate>(
		parseDate(new Date().toISOString().split("T")[0])
	);
	const [nextServiceDate, setNextServiceDate] = useState<CalendarDate | null>(
		null
	);

	useEffect(() => {
		if (isOpen || service) {
			setDate(
				service?.date
					? parseDate(service.date.toISOString().split("T")[0])
					: parseDate(new Date().toISOString().split("T")[0])
			);
			setNextServiceDate(
				nextService
					? parseDate(nextService.toISOString().split("T")[0])
					: null
			);
		}
	}, [isOpen, service, nextService]);

	const mileageRef = useRef<HTMLInputElement>(null);
	const serviceTypeRef = useRef<HTMLInputElement>(null);
	const priceRef = useRef<HTMLInputElement>(null);
	const notesRef = useRef<HTMLTextAreaElement>(null);

	const { mutate: addService, isPending: isAdding } = useAddService();
	const { mutate: updateService, isPending: isUpdating } = useUpdateService();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const serviceData = {
			date: dateToFirebaseTimestamp(new Date(date.toString())),
			mileage: Number(mileageRef.current?.value),
			serviceType: serviceTypeRef.current?.value || "",
			price: Number(priceRef.current?.value),
			notes: notesRef.current?.value || "",
			nextServiceDate: nextServiceDate
				? dateToFirebaseTimestamp(new Date(nextServiceDate.toString()))
				: null,
		};

		if (mode === "add") {
			addService(
				{ vehicleId, service: serviceData },
				{
					onSuccess: () => {
						onClose();
					},
				}
			);
		} else {
			updateService(
				{
					vehicleId,
					service: { ...serviceData, id: service!.id },
				},
				{
					onSuccess: () => {
						onClose();
					},
				}
			);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="2xl" placement="center">
			<ModalContent>
				{(onClose) => (
					<form onSubmit={handleSubmit}>
						<ModalHeader>
							{mode === "add"
								? "Add New Service"
								: "Edit Service"}
						</ModalHeader>
						<ModalBody className="gap-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<DatePicker
									showMonthAndYearPickers
									label="Service Date"
									value={date}
									onChange={(newDate) =>
										newDate && setDate(newDate)
									}
									isRequired
									variant="bordered"
									labelPlacement="outside"
								/>
								<Input
									type="number"
									label="Mileage"
									ref={mileageRef}
									defaultValue={service?.mileage.toString()}
									isRequired
									variant="bordered"
									labelPlacement="outside"
								/>
							</div>
							<Input
								label="Service Type"
								ref={serviceTypeRef}
								defaultValue={service?.serviceType}
								isRequired
								variant="bordered"
								labelPlacement="outside"
							/>
							<Input
								type="number"
								label="Price"
								ref={priceRef}
								defaultValue={service?.price.toString()}
								startContent={
									<span className="text-xs">MKD</span>
								}
								isRequired
								variant="bordered"
								labelPlacement="outside"
							/>
							<Textarea
								label="Notes"
								isRequired
								ref={notesRef}
								defaultValue={service?.notes}
								variant="bordered"
								labelPlacement="outside"
							/>
							<DatePicker
								showMonthAndYearPickers
								label="Next Service Date"
								value={nextServiceDate}
								onChange={(newDate) =>
									newDate && setNextServiceDate(newDate)
								}
								variant="bordered"
								labelPlacement="outside"
								description="When should a service be performed again?"
							/>
						</ModalBody>
						<ModalFooter>
							<Button variant="light" onPress={onClose}>
								Cancel
							</Button>
							<Button
								color="primary"
								type="submit"
								isLoading={isAdding || isUpdating}
							>
								{mode === "add"
									? "Add Service"
									: "Update Service"}
							</Button>
						</ModalFooter>
					</form>
				)}
			</ModalContent>
		</Modal>
	);
};
