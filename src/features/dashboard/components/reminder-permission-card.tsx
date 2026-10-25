import { Button, Card, CardBody } from "@nextui-org/react";
import { IconBell, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
	notificationPermission,
	REMINDER_DISMISSED_KEY,
	requestReminderPermission,
} from "../../../services/notifications";

/**
 * Browsers reject a permission request that is not tied to a user gesture, so
 * reminders have to be opted into with a real click rather than on load.
 */
export default function ReminderPermissionCard() {
	const [hidden, setHidden] = useState(
		() =>
			notificationPermission() !== "default" ||
			localStorage.getItem(REMINDER_DISMISSED_KEY) === "true"
	);

	if (hidden) return null;

	const enable = async () => {
		const result = await requestReminderPermission();
		if (result === "granted") {
			toast.success("Reminders on — you'll be told when a service is due");
		} else if (result === "denied") {
			toast.info("Reminders stay off. You can change this in site settings.");
		}
		setHidden(true);
	};

	const dismiss = () => {
		localStorage.setItem(REMINDER_DISMISSED_KEY, "true");
		setHidden(true);
	};

	return (
		<Card className="border border-primary-200">
			<CardBody className="flex flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<IconBell className="text-primary w-6 h-6 flex-shrink-0" />
					<div>
						<p className="text-md">Get told when a service is due</p>
						<p className="text-small text-default-500">
							Service Nova will notify you and badge the app icon
							when a vehicle needs attention.
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 flex-shrink-0">
					<Button color="primary" size="sm" onPress={enable}>
						Enable
					</Button>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						aria-label="Dismiss"
						onPress={dismiss}
					>
						<IconX size={18} />
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}
