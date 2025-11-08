export interface Company {
  id: number;
  name: string;
  description: string;
  website: string | null;
  email: string | null;
  logo: string | null;
  owner_id?: number | null;
  created_at: string;
  updated_at: string;
}

