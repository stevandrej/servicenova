import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MainLayout } from "../layouts/main.layout";
import { authQueryOptions } from "../stores/auth.store";

export const Route = createFileRoute("/_auth")({
  loader: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(authQueryOptions);
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});
