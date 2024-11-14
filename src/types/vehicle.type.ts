import { TService } from "./service.type";

export interface TVehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
}

export type TVehicleWithServices = TVehicle & { services: TService[] };
