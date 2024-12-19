import { Card, CardBody, CardHeader, Progress } from "@nextui-org/react";
import {
  IconCar,
  IconTools,
  IconAlertTriangle,
  IconCalendarDue,
  IconReceipt,
} from "@tabler/icons-react";
import { VehicleMetricCard } from "../vehicle-details/VehicleMetricCard";
import { useMemo } from "react";
import { Route as DashboardRoute } from "../../routes/_auth/dashboard";

export const Dashboard = () => {
  const vehicles = DashboardRoute.useLoaderData();

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const allServices = vehicles.flatMap((v) => v.services || []);
    const totalSpent = allServices.reduce((acc, s) => acc + (s.price || 0), 0);
    const upcomingServices = vehicles.filter(
      (v) => v.nextServiceDate && new Date(v.nextServiceDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    return {
      totalVehicles: vehicles.length,
      totalServices: allServices.length,
      totalSpent,
      upcomingServices: upcomingServices.length,
      averagePerVehicle: vehicles.length ? totalSpent / vehicles.length : 0,
    };
  }, [vehicles]);

  // Get vehicles needing attention (upcoming service or high mileage)
  const vehiclesNeedingAttention = useMemo(() => {
    return vehicles
      .filter((v) => {
        const lastService = v.services?.[0];
        if (!lastService) return true;
        
        const daysSinceLastService = Math.floor(
          (Date.now() - lastService.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return daysSinceLastService > 180; // More than 6 months
      })
      .slice(0, 3); // Show top 3
  }, [vehicles]);

  // Calculate monthly spending
  const monthlySpending = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    const spending = last6Months.map((month) => ({
      month,
      amount: vehicles
        .flatMap((v) => v.services || [])
        .filter((s) => {
          const serviceMonth = s.date.toLocaleString('default', { month: 'short' });
          return serviceMonth === month;
        })
        .reduce((acc, s) => acc + (s.price || 0), 0),
    }));

    return { months: last6Months, data: spending };
  }, [vehicles]);

  return (
    <div className="space-y-6">
      {/* Overview Section */}
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
            value={`$${dashboardMetrics.totalSpent.toLocaleString()}`}
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

      {/* Vehicles Needing Attention */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Needs Attention</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehiclesNeedingAttention.map((vehicle) => (
            <Card key={vehicle.id} className="border border-warning-200">
              <CardHeader className="flex gap-3">
                <IconAlertTriangle className="text-warning w-6 h-6" />
                <div className="flex flex-col">
                  <p className="text-md">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-small text-default-500">
                    Last service:{" "}
                    {vehicle.services?.[0]
                      ? new Date(vehicle.services[0].date).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Monthly Spending Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
        <Card>
          <CardBody className="p-6">
            <div className="space-y-4">
              {monthlySpending.data.map((item) => (
                <div key={item.month} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.month}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={item.amount}
                    maxValue={Math.max(...monthlySpending.data.map((d) => d.amount))}
                    className="h-2"
                    color="primary"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
