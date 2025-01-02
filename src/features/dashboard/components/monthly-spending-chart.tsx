import { Card, CardBody, Progress } from "@nextui-org/react";
import { useMemo } from "react";
import { TVehicleWithServices } from "../../../types/vehicle.type";

export default function MonthlySpendingChart({
	vehicles,
}: {
	vehicles: TVehicleWithServices[];
}) {
	const monthlySpending = useMemo(() => {
		const last6Months = Array.from({ length: 6 }, (_, i) => {
			const date = new Date();
			date.setMonth(date.getMonth() - i);
			return date.toLocaleString("default", { month: "short" });
		}).reverse();

		const spending = last6Months.map((month) => ({
			month,
			amount: vehicles
				.flatMap((v) => v.services || [])
				.filter((s) => {
					const serviceMonth = s.date.toLocaleString("default", {
						month: "short",
					});
					return serviceMonth === month;
				})
				.reduce((acc, s) => acc + (s.price || 0), 0),
		}));

		return { months: last6Months, data: spending };
	}, [vehicles]);

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
			<Card>
				<CardBody className="p-6">
					<div className="space-y-4">
						{monthlySpending.data.map((item) => (
							<div key={item.month} className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>{item.month}</span>
									<span>
										{item.amount.toLocaleString()}{" "}
										<span className="text-xs">MKD</span>
									</span>
								</div>
								<Progress
									value={item.amount}
									maxValue={Math.max(
										...monthlySpending.data.map(
											(d) => d.amount
										)
									)}
									className="h-2"
									color="primary"
								/>
							</div>
						))}
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
