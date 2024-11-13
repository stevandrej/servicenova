import { cn } from "../../lib/utils";
import { useSidebar } from "./useSidebar";
import { motion } from "framer-motion";

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-800 w-[250px] flex-shrink-0 fixed z-50",
          className
        )}
        animate={{
          width: animate ? (open ? "250px" : "60px") : "250px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};
