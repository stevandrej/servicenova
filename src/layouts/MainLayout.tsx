import { FC, ReactNode } from "react";
import { User } from "firebase/auth";

interface MainLayoutProps {
  user: User;
  onSignOut: () => void;
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ user, onSignOut, children }) => {
  return (
    <div>
      <div>
        <h1>Welcome, {user.displayName}!</h1>
        <button onClick={onSignOut}>Sign Out</button>
      </div>
      {children}
    </div>
  );
}; 