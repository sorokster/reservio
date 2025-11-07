import { MenuItem } from "./menu-item";
import { Cuisine } from "./cuisine";

export interface Menu {
  id: number;
  restaurant: number;
  name: string;
  description: string;
  order: number;
  cuisines: Cuisine[];
  items: MenuItem[];
}

