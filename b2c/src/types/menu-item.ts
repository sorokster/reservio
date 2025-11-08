import type { MenuCategory } from "./menu-category";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  weight?: number | null;
  is_new?: boolean;
  image: string | null;
  category: MenuCategory;
  category_id: number;
  restaurant_id?: number;
  created_at?: string;
  updated_at?: string;
}

