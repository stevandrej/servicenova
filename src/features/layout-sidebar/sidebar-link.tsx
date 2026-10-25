import { HTMLAttributes } from "react";
import { useSidebar } from "./useSidebar";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Links } from "./sidebar-link.type";
import { Link } from "@tanstack/react-router";

const baseClasses =
  "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md w-full text-left transition-colors";

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: HTMLAttributes<HTMLAnchorElement>;
}) => {
  const { open, setOpen, animate } = useSidebar();

  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const label = (
    <motion.span
      animate={{
        display: animate ? (open ? "inline-block" : "none") : "inline-block",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className="text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
    >
      {link.label}
    </motion.span>
  );

  // An entry that only runs an action - Logout, the user row - is a button.
  // As a <Link to="#"> it navigated as well as firing its action, and could
  // not be reached or activated from the keyboard as a control.
  if (!link.href) {
    return (
      <button
        type="button"
        onClick={() => {
          closeOnMobile();
          link.action?.();
        }}
        disabled={!link.action}
        className={cn(
          baseClasses,
          link.action ? "hover:bg-primary-800" : "cursor-default",
          className
        )}
      >
        {link.icon}
        {label}
      </button>
    );
  }

  return (
    <Link
      to={link.href}
      onClick={closeOnMobile}
      className={cn(baseClasses, "hover:bg-primary-800", className)}
      // TanStack Router resolves the active route for us; without this every
      // link looked identical and you could not tell which page you were on.
      activeProps={{ className: "bg-primary-700" }}
      {...props}
    >
      {link.icon}
      {label}
    </Link>
  );
};
