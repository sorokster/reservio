import type { MenuItem } from "./menu-item";
import type { MenuCategory } from "./menu-category";

export interface Menu {
  id: number;
  restaurant: number;
  name: string;
  description: string;
  order: number;
  categories: MenuCategory[];
  items: MenuItem[];
}
