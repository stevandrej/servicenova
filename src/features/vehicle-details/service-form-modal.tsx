import { useRef, useState } from "react";
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
import { suggestNextServiceDate } from "../../utils/serviceDue";

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
	// Once the user picks a next service date themselves, their choice sticks
	// and the service type no longer moves it.
	const [nextDateTouched, setNextDateTouched] = useState(false);

	// Reset the form whenever the modal opens for a (possibly different) service.
	// Adjusted during render rather than in an effect, per React's guidance for
	// resetting state on prop changes: https://react.dev/learn/you-might-not-need-an-effect
	const [syncedKey, setSyncedKey] = useState<string | null>(null);
	const openKey =
		isOpen || service
			? `${isOpen}:${service?.id ?? ""}:${nextService?.getTime() ?? ""}`
			: null;
	if (openKey !== null && openKey !== syncedKey) {
		setSyncedKey(openKey);
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
		// A date already saved on this record is the user's own choice, so
		// editing must not overwrite it. A fresh record starts open to a
		// suggestion even though it seeds from the vehicle's current reminder.
		setNextDateTouched(Boolean(service?.nextServiceDate));
	}

	/**
	 * Moves the next service date to match how long this kind of service lasts.
	 * Only ever fills in a suggestion - it never clears an existing date, and it
	 * does nothing once the user has set the date themselves.
	 */
	const applySuggestion = (
		serviceDate: CalendarDate,
		nextServiceType: string
	) => {
		if (nextDateTouched) return;

		const suggestion = suggestNextServiceDate(
			new Date(serviceDate.toString()),
			nextServiceType
		);
		if (suggestion) {
			setNextServiceDate(
				parseDate(suggestion.toISOString().split("T")[0])
			);
		}
	};

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
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			// The wrapper is sized from the visual viewport, so a centered modal
			// re-centers itself - visibly jumping - when the on-screen keyboard
			// opens. Top-anchored below sm, where that keyboard exists.
			placement="top-center"
			// Keeps the header and submit button put and scrolls only the
			// fields, instead of the modal outgrowing the space above the
			// keyboard.
			scrollBehavior="inside"
			classNames={{
				base: "max-h-[calc(100%_-_0.5rem)] sm:max-h-[calc(100%_-_8rem)]",
			}}
		>
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
									onChange={(newDate) => {
										if (!newDate) return;
										setDate(newDate);
										applySuggestion(newDate, serviceType);
									}}
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
								onInputChange={(value) => {
									setServiceType(value);
									applySuggestion(date, value);
								}}
								onSelectionChange={(key) => {
									const preset = SERVICE_TYPE_PRESETS.find(
										(p) => p.key === key
									);
									if (preset) {
										setServiceType(preset.label);
										applySuggestion(date, preset.label);
									}
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
								onChange={(newDate) => {
									setNextDateTouched(true);
									setNextServiceDate(newDate);
								}}
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
