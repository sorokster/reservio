import type { Country } from "./country";
import type { City } from "./city";

export interface RestaurantLocation {
  id: number;
  restaurant: number;
  country: Country;
  city: City;
  address: string;
  description?: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

