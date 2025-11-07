import { Country } from "./country";
import { City } from "./city";
import { Company } from "./company";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  company: Company;
  country: Country;
  city: City;
  average_rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

