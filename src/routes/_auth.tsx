import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MainLayout } from "../layouts/MainLayout";
import { auth } from "../config/firebase";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    const user = auth.currentUser;
    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});
