export interface TService {
  id: string;
  date: Date;
  mileage: number;
  price: number;
  serviceType: string;
  notes: string;
  /**
   * When the next service was due as of *this* visit. The vehicle carries a
   * denormalized copy of the newest record's value; keeping it per record is
   * what stops editing an old service from rewriting the live reminder.
   */
  nextServiceDate: Date | null;
}
