import { Route as DashboardRoute } from "../../routes/_auth/dashboard";
import VehiclesNeedAttention from "./components/vehicles-need-attention";
import MonthlySpendingChart from "./components/monthly-spending-chart";
import Overview from "./components/overview";

export const Dashboard = () => {
	const vehicles = DashboardRoute.useLoaderData();

	return (
		<div className="space-y-6">
			<Overview vehicles={vehicles} />
			<VehiclesNeedAttention vehicles={vehicles} />
			<MonthlySpendingChart vehicles={vehicles} />
		</div>
	);
};
