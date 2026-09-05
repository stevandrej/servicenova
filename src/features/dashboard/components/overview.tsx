import {
	IconCalendarDue,
	IconCar,
	IconChartBar,
	IconReceipt,
	IconTools,
} from "@tabler/icons-react";
import { VehicleMetricCard } from "../../vehicle-details/vehicle-metric-card";
import { useMemo } from "react";
import { TVehicleWithServices } from "../../../types/vehicle.type";
import { DUE_SOON_DAYS, getVehiclesDue } from "../../../utils/serviceDue";
import { formatCurrency } from "../../../utils/formatCurrency";

export default function Overview({
	vehicles,
}: {
	vehicles: TVehicleWithServices[];
}) {
	const dashboardMetrics = useMemo(() => {
		const allServices = vehicles.flatMap((v) => v.services || []);
		const totalSpent = allServices.reduce(
			(acc, s) => acc + (s.price || 0),
			0
		);
		const upcomingServices = getVehiclesDue(vehicles);

		return {
			totalVehicles: vehicles.length,
			totalServices: allServices.length,
			totalSpent,
			upcomingServices: upcomingServices.length,
			averagePerVehicle: vehicles.length
				? totalSpent / vehicles.length
				: 0,
		};
	}, [vehicles]);

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Overview</h2>
			<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
				<VehicleMetricCard
					title="Total Vehicles"
					value={dashboardMetrics.totalVehicles.toString()}
					description="Active vehicles in fleet"
					icon={<IconCar className="w-5 h-5" />}
				/>
				<VehicleMetricCard
					title="Total Services"
					value={dashboardMetrics.totalServices.toString()}
					description="All-time service records"
					icon={<IconTools className="w-5 h-5" />}
				/>
				<VehicleMetricCard
					title="Total Spent"
					value={formatCurrency(dashboardMetrics.totalSpent)}
					description="Lifetime maintenance cost"
					icon={<IconReceipt className="w-5 h-5" />}
				/>
				<VehicleMetricCard
					title="Upcoming Services"
					value={dashboardMetrics.upcomingServices.toString()}
					description={`Due or overdue within ${DUE_SOON_DAYS} days`}
					icon={<IconCalendarDue className="w-5 h-5" />}
				/>
				<VehicleMetricCard
					title="Average per Vehicle"
					value={formatCurrency(dashboardMetrics.averagePerVehicle)}
					description="Lifetime cost per vehicle"
					icon={<IconChartBar className="w-5 h-5" />}
				/>
			</div>
		</div>
	);
}
