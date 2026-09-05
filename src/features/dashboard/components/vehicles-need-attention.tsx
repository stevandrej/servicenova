import { Card, CardHeader } from "@nextui-org/react";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { TVehicleWithServices } from "../../../types/vehicle.type";
import { formatDate } from "../../../utils/formatDate";
import { getVehiclesNeedingAttention } from "../../../utils/serviceDue";

const VISIBLE_COUNT = 3;

export default function VehiclesNeedAttention({
	vehicles,
}: {
	vehicles: TVehicleWithServices[];
}) {
	const needingAttention = useMemo(
		() => getVehiclesNeedingAttention(vehicles),
		[vehicles]
	);

	const visible = needingAttention.slice(0, VISIBLE_COUNT);
	const hiddenCount = needingAttention.length - visible.length;

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Needs Attention</h2>
			{visible.length === 0 ? (
				<Card>
					<CardHeader className="flex gap-3">
						<IconCircleCheck className="text-success w-6 h-6" />
						<p className="text-md">
							Everything's up to date — nothing is due right now.
						</p>
					</CardHeader>
				</Card>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{visible.map((vehicle) => (
							<Link
								key={vehicle.id}
								to="/vehicles/$vehicleId"
								params={{ vehicleId: vehicle.id }}
							>
								<Card className="border border-warning-200 hover:border-warning h-full">
									<CardHeader className="flex gap-3">
										<IconAlertTriangle className="text-warning w-6 h-6" />
										<div className="flex flex-col">
											<p className="text-md">
												{vehicle.make} {vehicle.model}
											</p>
											<p className="text-small text-default-500">
												Last service:{" "}
												{vehicle.services?.[0]
													? formatDate(
															vehicle.services[0]
																.date
													  )
													: "Never"}
											</p>
										</div>
									</CardHeader>
								</Card>
							</Link>
						))}
					</div>
					{hiddenCount > 0 && (
						<p className="text-small text-default-500 mt-2">
							+{hiddenCount} more vehicle
							{hiddenCount === 1 ? "" : "s"} need attention
						</p>
					)}
				</>
			)}
		</div>
	);
}
