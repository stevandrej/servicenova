import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MainLayout } from "../layouts/MainLayout";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    //TODO: MOVE TO COOKIE OR STORAGE
    // const user = context.queryClient.getQueryData(["user"]);

    // if (!user) {
    //   throw redirect({
    //     to: "/login",
    //   });
    // }
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});
