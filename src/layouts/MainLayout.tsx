import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "../features/layout-sidebar/Sidebar";
import { ToastContainer } from "react-toastify";
import { getTimeBasedBackground } from "../utils/getTimeBasedBackground";
import { cn } from "../lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [open, setOpen] = useState(false);

  const [bgClass, setBgClass] = useState(getTimeBasedBackground());

  // Update background every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setBgClass(getTimeBasedBackground());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={cn(
          "flex flex-col md:flex-row bg-neutral-800 w-full h-screen flex-1 mx-auto"
        )}
      >
        <Sidebar open={open} setOpen={setOpen} animate />
        <div
          className={cn(
            bgClass,
            "transition-all duration-[2000ms] ease-in-out",
            "p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full md:ml-[60px] overflow-auto",
            "bg-white dark:bg-neutral-900"
          )}
        >
          {children}
        </div>
      </div>
      <ToastContainer theme="dark" position="top-right" />
    </>
  );
};
