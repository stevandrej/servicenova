import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { motion } from "framer-motion";

// children is narrowed to ReactNode: motion.div's own prop type also admits a
// MotionValue, which neither sidebar can render.
type SidebarBodyProps = Omit<
  React.ComponentProps<typeof motion.div>,
  "children"
> & { children?: React.ReactNode };

export const SidebarBody = (props: SidebarBodyProps) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};
