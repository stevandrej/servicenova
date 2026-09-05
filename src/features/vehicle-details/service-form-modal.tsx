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
	Autocomplete,
	AutocompleteItem,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { TService } from "../../types/service.type";
import { useAddService } from "../../services/useAddService";
import { useUpdateService } from "../../services/useUpdateService";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { dateToFirebaseTimestamp } from "../../utils/formatDate";
import { CURRENCY } from "../../utils/formatCurrency";
import { SERVICE_TYPE_PRESETS } from "../../utils/serviceTypes";

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
	const [date, setDate] = useState<CalendarDate>(today(getLocalTimeZone()));
	const [nextServiceDate, setNextServiceDate] = useState<CalendarDate | null>(
		null
	);
	// Autocomplete needs a controlled value, unlike the ref-driven inputs.
	const [serviceType, setServiceType] = useState("");

	useEffect(() => {
		if (isOpen || service) {
			setDate(
				service?.date
					? parseDate(service.date.toISOString().split("T")[0])
					: today(getLocalTimeZone())
			);
			// Editing shows the date *this* record set, so saving an old
			// service can no longer overwrite the vehicle's live reminder.
			// Adding starts from the vehicle's current one.
			const seed = service ? service.nextServiceDate : nextService;
			setNextServiceDate(
				seed ? parseDate(seed.toISOString().split("T")[0]) : null
			);
			setServiceType(service?.serviceType ?? "");
		}
	}, [isOpen, service, nextService]);

	const mileageRef = useRef<HTMLInputElement>(null);
	const priceRef = useRef<HTMLInputElement>(null);
	const notesRef = useRef<HTMLTextAreaElement>(null);

	const { mutate: addService, isPending: isAdding } = useAddService();
	const { mutate: updateService, isPending: isUpdating } = useUpdateService();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const serviceData = {
			date: dateToFirebaseTimestamp(new Date(date.toString())),
			mileage: Number(mileageRef.current?.value),
			serviceType: serviceType.trim(),
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
							{/* allowsCustomValue: the presets are suggestions,
							    not a closed list - any text still saves. */}
							<Autocomplete
								label="Service Type"
								allowsCustomValue
								isRequired
								inputValue={serviceType}
								onInputChange={setServiceType}
								onSelectionChange={(key) => {
									const preset = SERVICE_TYPE_PRESETS.find(
										(p) => p.key === key
									);
									if (preset) setServiceType(preset.label);
								}}
								variant="bordered"
								labelPlacement="outside"
								placeholder="e.g. Oil change"
							>
								{SERVICE_TYPE_PRESETS.map((preset) => (
									<AutocompleteItem
										key={preset.key}
										startContent={
											<preset.icon size={18} />
										}
									>
										{preset.label}
									</AutocompleteItem>
								))}
							</Autocomplete>
							<Input
								type="number"
								label="Price"
								ref={priceRef}
								defaultValue={service?.price.toString()}
								startContent={
									<span className="text-xs">{CURRENCY}</span>
								}
								isRequired
								variant="bordered"
								labelPlacement="outside"
							/>
							<Textarea
								label="Notes"
								ref={notesRef}
								placeholder="Optional"
								defaultValue={service?.notes}
								variant="bordered"
								labelPlacement="outside"
							/>
							<DatePicker
								showMonthAndYearPickers
								label="Next Service Date"
								value={nextServiceDate}
								onChange={setNextServiceDate}
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
