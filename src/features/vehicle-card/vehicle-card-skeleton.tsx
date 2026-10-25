import { Skeleton } from "@nextui-org/react";

/**
 * Mirrors VehicleCard's shape so the grid keeps its layout while loading,
 * instead of collapsing to a centered spinner and jumping when data lands.
 */
export const VehicleCardSkeleton = () => (
  <div className="rounded-md overflow-hidden w-full shadow-lg">
    <Skeleton className="h-64 w-full" />
    <div className="p-4 bg-white flex flex-col gap-2">
      <Skeleton className="h-5 w-2/3 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <Skeleton className="h-4 w-3/5 rounded-md" />
    </div>
  </div>
);
