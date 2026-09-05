import { createFileRoute, redirect } from "@tanstack/react-router";
import { authService } from "../services/auth.service";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // waitForUser resolves on the first auth state callback, so a hard refresh
    // no longer bounces a signed-in user through /login.
    const user = await authService.waitForUser();
    throw redirect({
      to: user ? "/vehicles" : "/login",
    });
  },
});
