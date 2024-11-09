import { FC } from "react";

interface Car {
  id: string;
  [key: string]: string | number | object | boolean;
}

interface CarsListProps {
  cars: Car[];
  isLoading: boolean;
  error: Error | null;
}

export const CarsList: FC<CarsListProps> = ({ cars, isLoading, error }) => {
  if (isLoading) return <div>Loading cars...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Cars List</h2>
      {cars.map((car) => (
        <div key={car.id}>{JSON.stringify(car)}</div>
      ))}
    </div>
  );
}; 