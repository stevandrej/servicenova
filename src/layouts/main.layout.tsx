import { ReactNode, useState } from "react";
import { Chip } from "@nextui-org/react";
import { IconWifiOff } from "@tabler/icons-react";
import { Sidebar } from "../features/layout-sidebar/sidebar";
import { cn } from "../lib/utils";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useServiceReminders } from "../hooks/useServiceReminders";

interface MainLayoutProps {
	children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
	const [open, setOpen] = useState(false);
	const isOnline = useOnlineStatus();
	useServiceReminders();

	return (
		<>
			<div
				className={cn(
					"flex flex-col md:flex-row bg-slate-300 w-full h-screen flex-1 mx-auto"
				)}
			>
				<Sidebar open={open} setOpen={setOpen} animate />
				<div
					className={cn(
						"transition-[margin] duration-300 ease-in-out",
						"p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full md:ml-[60px] overflow-auto",
						"bg-white"
					)}
				>
					{children}
				</div>
			</div>
			{!isOnline && (
				<Chip
					color="warning"
					variant="flat"
					startContent={<IconWifiOff size={16} />}
					className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200]"
				>
					Offline — changes will sync
				</Chip>
			)}
		</>
	);
};
