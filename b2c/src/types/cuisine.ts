export interface Cuisine {
  id: number;
  name: string;
  menu: number[]; // Array of menu IDs
  // items is not included in API response anymore
}

