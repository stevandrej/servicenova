import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/login.page";
import { auth } from "../config/firebase";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    const user = auth.currentUser;
    if (user) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: LoginPage,
});
