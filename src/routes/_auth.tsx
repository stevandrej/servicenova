import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    //TODO: MOVE TO COOKIE OR STORAGE
    const user = context.queryClient.getQueryData(["user"]);
    
    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },
});
