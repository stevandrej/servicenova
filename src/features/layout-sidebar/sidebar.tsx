import { SidebarLink } from "./sidebar-link";
import { useSidebarLinks } from "./useSidebarLinks.data";
import { SidebarBody } from "./sidebar-body";
import { useAuth } from "../../hooks/useAuth";

// The SidebarProvider lives in MainLayout, not here: the content area also
// reads `pinned` from it to reserve the expanded rail's width.
export const Sidebar = () => {
  const links = useSidebarLinks();
  const { user } = useAuth();

  return (
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mt-8 flex flex-col gap-2">
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
      </div>
      <div>
        <SidebarLink
          link={{
            label: user?.displayName || "Guest",
            icon: <></>,
          }}
        />
      </div>
    </SidebarBody>
  );
};
