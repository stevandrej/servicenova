import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton } from "@nextui-org/react";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { TVehicle } from "../../types/vehicle.type";
import { VehicleDetails } from "./vehicle-details";

export function VehicleDetailsPage() {
  const { vehicleId } = useParams({ from: "/_auth/vehicles_/$vehicleId" });
  const { data: vehicles, isLoading: isLoadingVehicles } =
    useQuery(vehiclesQueryOptions);
  const vehicle = vehicles?.find((v: TVehicle) => v.id === vehicleId);
  const isLoading = isLoadingVehicles;

  if (isLoading) {
    // Mirrors the real layout so the page does not jump when data lands.
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="p-6 bg-white rounded-lg shadow-sm border space-y-4">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
          <p className="text-gray-600 mb-4">
            It may have been deleted, or the link may be wrong.
          </p>
          <Button as={Link} to="/vehicles" color="primary">
            Back to My Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return <VehicleDetails vehicle={vehicle} />;
}
