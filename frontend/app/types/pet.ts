export interface Pet {
  id: string;
  user_id: string;
  name: string;
  personality: string[];
  humor: string[];
  languages: string[];
  interests: string[];
  is_active: boolean;
  activity_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetCreate {
  name: string;
  personality: string[];
  humor: string[];
  languages: string[];
  interests: string[];
}

export interface PetUpdate {
  name?: string;
  personality?: string[];
  humor?: string[];
  languages?: string[];
  interests?: string[];
  is_active?: boolean;
  activity_enabled?: boolean;
}