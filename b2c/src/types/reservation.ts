import type { Restaurant } from "./restaurant";
import type { Table } from "./table";

export interface ReservationSlot {
  id: number;
  time_from: string;
  time_to: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationStatus {
  id: number;
  status: number | string; // Can be number (0, 1, 2) or string from API
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  user_id: number;
  restaurant: Restaurant;
  restaurant_id: number;
  table: Table;
  table_id: number;
  date: string;
  guests: number;
  time_slots: ReservationSlot[];
  statuses: ReservationStatus[];
  created_at: string;
  updated_at: string;
}

