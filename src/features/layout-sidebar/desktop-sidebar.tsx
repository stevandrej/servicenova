import { useEffect } from "react";
import { cn } from "../../lib/utils";
import { useSidebar } from "./useSidebar";
import { motion } from "framer-motion";
import { IconPin, IconPinnedFilled } from "@tabler/icons-react";

// children is narrowed to ReactNode: motion.div's own prop type also admits a
// MotionValue, which is not renderable alongside the pin button.
export const DesktopSidebar = ({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & {
  children?: React.ReactNode;
}) => {
  const { open, setOpen, animate, pinned, setPinned } = useSidebar();

  // Pinning keeps the rail expanded; without it the sidebar opened and closed
  // every time the pointer crossed the left edge of the screen.
  useEffect(() => {
    if (pinned) setOpen(true);
  }, [pinned, setOpen]);

  const expanded = pinned || open;

  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-primary-900 w-[250px] flex-shrink-0 fixed z-50",
        className
      )}
      animate={{
        width: animate ? (expanded ? "250px" : "60px") : "250px",
      }}
      onMouseEnter={() => !pinned && setOpen(true)}
      onMouseLeave={() => !pinned && setOpen(false)}
      {...props}
    >
      <button
        type="button"
        onClick={() => setPinned(!pinned)}
        aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
        aria-pressed={pinned}
        title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
        className={cn(
          "self-end text-neutral-200 p-1 rounded-md hover:bg-primary-800 transition-opacity",
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {pinned ? <IconPinnedFilled size={18} /> : <IconPin size={18} />}
      </button>
      {children}
    </motion.div>
  );
};
