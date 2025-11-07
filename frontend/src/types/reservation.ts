import { Restaurant } from "./restaurant";
import { Table } from "./table";

export interface ReservationSlot {
  id: number;
  time_from: string;
  time_to: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationStatus {
  id: number;
  status: string;
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user: number;
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

