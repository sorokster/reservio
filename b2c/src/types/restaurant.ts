import type { City } from "./city";
import type { Company } from "./company";
import type { Cuisine } from "./cuisine";
import type { RestaurantLocation } from "./restaurant-location";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  preview: string | null;
  company: Company;
  city: City;
  cuisines?: Cuisine[];
  locations?: RestaurantLocation[];
  average_rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

