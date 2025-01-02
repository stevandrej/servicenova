import { Card, CardHeader } from "@nextui-org/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useMemo } from "react";
import { TVehicleWithServices } from "../../../types/vehicle.type";

export default function VehiclesNeedAttention({
	vehicles,
}: {
	vehicles: TVehicleWithServices[];
}) {
	const vehiclesNeedingAttention = useMemo(() => {
		return vehicles
			.filter((v) => {
				const lastService = v.services?.[0];
				if (!lastService) return true;

				const daysSinceLastService = Math.floor(
					(Date.now() - lastService.date.getTime()) /
						(1000 * 60 * 60 * 24)
				);

				const hasUpcomingService =
					v.nextServiceDate &&
					new Date(v.nextServiceDate) <=
						new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

				return daysSinceLastService > 320 || hasUpcomingService; // More than 10 months or service due within a month
			})
			.slice(0, 3); // Show top 3
	}, [vehicles]);

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Needs Attention</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{vehiclesNeedingAttention.map((vehicle) => (
					<Card
						key={vehicle.id}
						className="border border-warning-200"
					>
						<CardHeader className="flex gap-3">
							<IconAlertTriangle className="text-warning w-6 h-6" />
							<div className="flex flex-col">
								<p className="text-md">
									{vehicle.make} {vehicle.model}
								</p>
								<p className="text-small text-default-500">
									Last service:{" "}
									{vehicle.services?.[0]
										? new Date(
												vehicle.services[0].date
										  ).toLocaleDateString()
										: "Never"}
								</p>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
