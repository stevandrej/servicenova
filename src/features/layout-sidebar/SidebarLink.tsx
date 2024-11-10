import { HTMLAttributes } from "react";
import { useSidebar } from "./useSidebar";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Links } from "./sidebarLink.type";

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: HTMLAttributes<HTMLAnchorElement>;
}) => {
  const { open, animate } = useSidebar();
  const handleClick = () => {
    link.action?.();
  };

  return (
    <a
      href={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center justify-start gap-2  group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
