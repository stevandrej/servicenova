import { ReactNode, useState } from "react";
import { Sidebar } from "../features/layout-sidebar/Sidebar";
import { useAuth } from "../hooks/useAuth";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col md:flex-row bg-neutral-800 w-full h-screen flex-1 mx-auto overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} animate />
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div>
          <h1>Welcome, {user?.displayName}!</h1>
          <button onClick={logout}>Sign Out</button>
        </div>
        {children}
      </div>
    </div>
  );
};
