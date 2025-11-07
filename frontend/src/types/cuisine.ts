import { MenuItem } from "./menu-item";

export interface Cuisine {
  id: number;
  name: string;
  menu: number[];
  items: MenuItem[];
}

