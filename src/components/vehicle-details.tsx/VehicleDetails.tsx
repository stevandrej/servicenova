import type { TVehicle } from "../../types/vehicle.type";

interface VehicleDetailsProps {
  vehicle: TVehicle;
}

export const VehicleDetails = ({ vehicle }: VehicleDetailsProps) => {
  console.log(vehicle);
  return <div>VehicleDetails</div>;
};
