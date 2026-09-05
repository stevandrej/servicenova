import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReloadPrompt } from "../components/ReloadPrompt";
import { NotFound } from "../components/not-found";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <Outlet />
      <ToastContainer theme="dark" position="top-right" />
      {/* Mounted at the root, not inside MainLayout: the service worker has to
          register before sign-in, or the precache and runtime caches never warm
          up for a user who lands on /login first. */}
      <ReloadPrompt />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
  notFoundComponent: NotFound,
});
