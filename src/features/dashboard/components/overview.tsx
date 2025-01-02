import {
	IconCalendarDue,
	IconCar,
	IconReceipt,
	IconTools,
} from "@tabler/icons-react";
import { VehicleMetricCard } from "../../vehicle-details/VehicleMetricCard";
import { useMemo } from "react";
import { TVehicleWithServices } from "../../../types/vehicle.type";

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
		const upcomingServices = vehicles.filter(
			(v) =>
				v.nextServiceDate &&
				new Date(v.nextServiceDate) <=
					new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		);

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
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
					value={`${dashboardMetrics.totalSpent.toLocaleString()} MKD`}
					description="Lifetime maintenance cost"
					icon={<IconReceipt className="w-5 h-5" />}
				/>
				<VehicleMetricCard
					title="Upcoming Services"
					value={dashboardMetrics.upcomingServices.toString()}
					description="Due within 30 days"
					icon={<IconCalendarDue className="w-5 h-5" />}
				/>
			</div>
		</div>
	);
}
