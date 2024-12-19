import { ReactNode, useState } from "react";
import { Sidebar } from "../features/layout-sidebar/Sidebar";
import { cn } from "../lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-col md:flex-row bg-slate-300 w-full h-screen flex-1 mx-auto"
        )}
      >
        <Sidebar open={open} setOpen={setOpen} animate />
        <div
          className={cn(
            "transition-all duration-[2000ms] ease-in-out",
            "p-2 md:p-10 flex flex-col gap-2 flex-1 w-full h-full md:ml-[60px] overflow-auto",
            "bg-white"
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
};
