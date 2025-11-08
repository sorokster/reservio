export interface Schedule {
  id: number;
  restaurant: number;
  weekday: number;
  weekday_display: string;
  is_closed: boolean;
  time_from: string | null;
  time_to: string | null;
  created_at: string;
  updated_at: string;
}

