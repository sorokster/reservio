import type { MenuItem } from "./menu-item";
import type { Cuisine } from "./cuisine";

export interface Menu {
  id: number;
  restaurant: number;
  name: string;
  description: string;
  order: number;
  cuisines: Cuisine[];
  items: MenuItem[];
}
