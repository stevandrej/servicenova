import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { vehiclesQueryOptions } from "../../services/useFetchVehicles";
import { VehicleCard } from "../../features/vehicle-card/vehicle-card";
import { VehicleCardSkeleton } from "../../features/vehicle-card/vehicle-card-skeleton";
import { cn } from "../../lib/utils";
import { Button, Input, Select, SelectItem, useDisclosure } from "@nextui-org/react";
import { IconCar, IconPlus, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { VehicleFormModal } from "../../features/vehicle-details/vehicle-form-modal";
import { getServiceUrgency } from "../../utils/serviceDue";

export const Route = createFileRoute("/_auth/vehicles")({
  // Matches /dashboard, so defaultPreload: "intent" can warm this route on
  // hover instead of showing skeletons after the click.
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(vehiclesQueryOptions),
  component: RouteComponent,
});

const SORTS = {
  urgency: "Next service due",
  make: "Make and model",
  year: "Newest first",
} as const;

type SortKey = keyof typeof SORTS;

const urgencyRank = {
  overdue: 0,
  "due-soon": 1,
  upcoming: 2,
  ok: 3,
  none: 4,
} as const;

function RouteComponent() {
  const { data: vehicles, isLoading } = useQuery(vehiclesQueryOptions);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("urgency");

  const visible = useMemo(() => {
    if (!vehicles) return [];

    const term = search.trim().toLowerCase();
    const matched = term
      ? vehicles.filter((v) =>
          `${v.make} ${v.model} ${v.plate} ${v.year}`
            .toLowerCase()
            .includes(term)
        )
      : vehicles;

    return [...matched].sort((a, b) => {
      if (sort === "make") {
        return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
      }
      if (sort === "year") return b.year - a.year;
      return (
        urgencyRank[getServiceUrgency(a.nextServiceDate)] -
        urgencyRank[getServiceUrgency(b.nextServiceDate)]
      );
    });
  }, [vehicles, search, sort]);

  const gridClasses = cn(
    "grid gap-6",
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Vehicles</h1>
          <p className="text-gray-500">
            Manage and track your vehicle services
          </p>
        </div>
        <Button
          color="primary"
          endContent={<IconPlus size={20} />}
          onPress={onOpen}
        >
          Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className={gridClasses}>
          {Array.from({ length: 4 }, (_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      ) : !vehicles?.length ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
          <IconCar
            className="w-24 h-24 mb-4 text-gray-400"
            stroke={1.25}
            aria-hidden
          />
          <h3 className="text-xl font-semibold text-gray-700">
            No vehicles yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first vehicle to get started
          </p>
          <Button color="primary" onPress={onOpen}>
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <>
          {/* Only worth the space once the fleet is big enough to scan. */}
          {vehicles.length > 3 && (
            <div className="flex gap-4 flex-wrap">
              <Input
                aria-label="Search vehicles"
                placeholder="Search make, model, plate or year"
                value={search}
                onValueChange={setSearch}
                isClearable
                variant="bordered"
                startContent={
                  <IconSearch size={18} className="text-default-400" />
                }
                className="max-w-xs"
              />
              <Select
                aria-label="Sort vehicles"
                selectedKeys={[sort]}
                onChange={(e) =>
                  e.target.value && setSort(e.target.value as SortKey)
                }
                variant="bordered"
                className="max-w-[200px]"
              >
                {Object.entries(SORTS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>
            </div>
          )}

          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No vehicles match "{search}".
              </p>
              <Button
                variant="light"
                color="primary"
                className="mt-2"
                onPress={() => setSearch("")}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className={gridClasses}>
              {visible.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  nextService={vehicle.nextServiceDate ?? undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      <VehicleFormModal
        isOpen={isOpen}
        onClose={onClose}
        mode="add"
        vehicle={undefined}
      />
    </div>
  );
}
