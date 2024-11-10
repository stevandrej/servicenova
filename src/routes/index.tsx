import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/LoginPage";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const user = context.queryClient.getQueryData(["user"]);

    if (user) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: LoginPage,
});
