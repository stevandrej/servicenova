import { createFileRoute } from "@tanstack/react-router";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { Dashboard } from "../../features/dashboard/dashboard";

export const Route = createFileRoute("/_auth/dashboard")({
	loader: ({ context: { queryClient } }) =>
		queryClient.ensureQueryData(vehiclesQueryOptions),
	component: Dashboard,
});
