import { Button } from "@nextui-org/react";
import { Timeline } from "../../../components/timeline/Timeline";

interface ServiceHistoryProps {
  timelineData: Array<{ title: string; content: React.ReactNode }>;
  onAddService: () => void;
}

export const ServiceHistory = ({ timelineData, onAddService }: ServiceHistoryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Service History</h2>
      {timelineData.length > 0 ? (
        <Timeline data={timelineData} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No service records found</p>
          <Button
            color="primary"
            variant="light"
            onPress={onAddService}
            className="mt-2"
          >
            Add First Service Record
          </Button>
        </div>
      )}
    </div>
  );
}; 