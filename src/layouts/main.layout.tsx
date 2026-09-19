import { ReactNode, useState } from "react";
import { Chip } from "@nextui-org/react";
import { IconWifiOff } from "@tabler/icons-react";
import { Sidebar } from "../features/layout-sidebar/sidebar";
import { SidebarProvider } from "../features/layout-sidebar/sidebar.provider";
import { useSidebar } from "../features/layout-sidebar/useSidebar";
import { cn } from "../lib/utils";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useServiceReminders } from "../hooks/useServiceReminders";

interface MainLayoutProps {
	children: ReactNode;
}

// The desktop rail is `fixed`, so the content reserves its width with a left
// margin instead of being pushed by it. Pinned, the rail is 250px wide and the
// margin has to match or it covers the page; unpinned it reserves only the
// collapsed 60px on purpose, so hovering the rail never reflows the content.
const MainContent = ({ children }: { children: ReactNode }) => {
	const { pinned } = useSidebar();

	return (
		<div
			className={cn(
				"transition-[margin] duration-300 ease-in-out",
				"p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full overflow-auto",
				pinned ? "md:ml-[250px]" : "md:ml-[60px]",
				"bg-white"
			)}
		>
			{children}
		</div>
	);
};

export const MainLayout = ({ children }: MainLayoutProps) => {
	const [open, setOpen] = useState(false);
	const isOnline = useOnlineStatus();
	useServiceReminders();

	return (
		<>
			{/* The provider wraps the content as well as the sidebar, so the
			    content area can size its margin from the pinned state. */}
			<SidebarProvider open={open} setOpen={setOpen} animate>
				<div
					className={cn(
						"flex flex-col md:flex-row bg-slate-300 w-full h-screen flex-1 mx-auto"
					)}
				>
					<Sidebar />
					<MainContent>{children}</MainContent>
				</div>
			</SidebarProvider>
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
