import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        queryClient.setQueryData(["user"], currentUser);
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      queryClient.setQueryData(["user"], result.user);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    queryClient.removeQueries({ queryKey: ["user"] });
  };

  return { user, login, logout };
};
