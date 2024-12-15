export interface TService {
  id: string;
  date: Date;
  mileage: number;
  price: number;
  serviceType: string;
  notes: string;
  nextServiceDate?: Date;
}
