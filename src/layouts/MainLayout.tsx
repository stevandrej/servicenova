import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "../features/layout-sidebar/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
