import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/login.page";
import { authService } from "../services/auth.service";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const user = await authService.waitForUser();
    if (user) {
      throw redirect({
        to: "/vehicles",
      });
    }
  },
  component: LoginPage,
});
