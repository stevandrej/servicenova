import { Card, CardBody, Progress } from "@nextui-org/react";
import { useMemo } from "react";
import { TVehicleWithServices } from "../../../types/vehicle.type";
import { formatCurrency } from "../../../utils/formatCurrency";

export default function MonthlySpendingChart({
	vehicles,
}: {
	vehicles: TVehicleWithServices[];
}) {
	const monthlySpending = useMemo(() => {
		const now = new Date();

		// Buckets are keyed on year *and* month - matching on the month name
		// alone would fold last year's September into this year's.
		const last6Months = Array.from({ length: 6 }, (_, i) => {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			return {
				year: date.getFullYear(),
				month: date.getMonth(),
				label: date.toLocaleString("en-GB", { month: "short" }),
			};
		}).reverse();

		const services = vehicles.flatMap((v) => v.services || []);

		return last6Months.map((bucket) => ({
			key: `${bucket.year}-${bucket.month}`,
			label: bucket.label,
			amount: services
				.filter(
					(s) =>
						s.date.getFullYear() === bucket.year &&
						s.date.getMonth() === bucket.month
				)
				.reduce((acc, s) => acc + (s.price || 0), 0),
		}));
	}, [vehicles]);

	const maxAmount = Math.max(...monthlySpending.map((d) => d.amount), 0);

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
			<Card>
				<CardBody className="p-6">
					<div className="space-y-4">
						{monthlySpending.map((item) => (
							<div key={item.key} className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>{item.label}</span>
									<span>{formatCurrency(item.amount)}</span>
								</div>
								<Progress
									value={item.amount}
									maxValue={maxAmount || 1}
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
