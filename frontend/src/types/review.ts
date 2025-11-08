import type { Restaurant } from "./restaurant";

export interface Review {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  user_id: number;
  restaurant: Restaurant;
  restaurant_id: number;
  rating: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

