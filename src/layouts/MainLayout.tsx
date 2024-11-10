import { ReactNode, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Sidebar } from "../features/layout-sidebar/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth(); // Get user and logout function
  const [open, setOpen] = useState(false);

  if (!user) return;
  return (
    <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen flex-1 mx-auto overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} animate />
      <div className="p-5">
        <div>
          <h1>Welcome, {user.displayName}!</h1>
          <button onClick={logout}>Sign Out</button>
        </div>
        {children}
      </div>
    </div>
  );
};
