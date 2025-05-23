export interface StoreHours {
  day_of_week: number;
  end_time: string;
  id: string;
  is_open: boolean;
  start_time: string;
}

export interface StoreOverride {
  day: number;
  end_time: string;
  id: string;
  is_open: boolean;
  month: number;
  start_time: string;
}
