import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [navigate]);

  return { user, loading, login, logout };
};
