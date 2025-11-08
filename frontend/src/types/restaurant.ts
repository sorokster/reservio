import type { Country } from "./country";
import type { City } from "./city";
import type { Company } from "./company";
import type { Cuisine } from "./cuisine";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  map_position?: {
    lat: number;
    lng: number;
  } | null;
  company: Company;
  country: Country;
  city: City;
  cuisines?: Cuisine[];
  average_rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

