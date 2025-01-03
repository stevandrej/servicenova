import {
  IconArrowLeft,
  IconCar,
  IconDashboard,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { Links } from "./sidebar-link.type";

export const useSidebarLinks = (): Links[] => {
  const { logout } = useAuth();

  return [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconDashboard className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Vehicles",
      href: "/vehicles",
      icon: <IconCar className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      href: "#",
      action: logout,
      icon: (
        <IconArrowLeft className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
};
