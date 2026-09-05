import { useSidebar } from "./useSidebar";
import { cn } from "../../lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-primary-900 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          {/* A button, not a bare SVG with onClick: the menu has to be
              reachable and activatable from the keyboard, and needs a name. */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            aria-expanded={open}
            className="text-neutral-200 p-1 -m-1"
          >
            <IconMenu2 />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-primary-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <button
                type="button"
                className="absolute right-10 top-10 z-50 text-neutral-200 p-1 -m-1"
                onClick={() => setOpen(!open)}
                aria-label="Close menu"
              >
                <IconX />
              </button>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
