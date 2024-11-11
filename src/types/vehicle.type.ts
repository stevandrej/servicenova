export interface TService {
  date: Date;
  mileage: number;
  price: number;
  serviceType: string;
  notes: string;
}

export interface TVehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
  services: TService[];
}
