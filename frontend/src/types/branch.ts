import { Country } from "./country";
import { City } from "./city";
import { Company } from "./company";

export interface Branch {
  id: number;
  name: string;
  description: string;
  company: Company;
  country: Country;
  city: City;
  created_at: string;
  updated_at: string;
}

