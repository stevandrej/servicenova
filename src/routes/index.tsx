import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "../config/firebase";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const user = auth.currentUser;
    throw redirect({
      to: user ? "/dashboard" : "/login",
    });
  },
});
