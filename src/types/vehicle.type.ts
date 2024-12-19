import { TService } from "./service.type";

export type TVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  imageUrl?: string;
  nextServiceDate?: Date | null;
};

export type TVehicleWithServices = TVehicle & {
  services: TService[];
};
