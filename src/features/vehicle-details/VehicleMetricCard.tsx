import { memo } from "react";

interface VehicleMetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

export const VehicleMetricCard = memo(({ 
  title, 
  value, 
  description,
  icon
}: VehicleMetricCardProps) => (
  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {icon && <div className="text-gray-600">{icon}</div>}
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  </div>
));

VehicleMetricCard.displayName = "VehicleMetricCard"; 