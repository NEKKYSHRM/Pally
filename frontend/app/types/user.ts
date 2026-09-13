export interface User {
  id: string;
  email: string;
  google_id: string;
  username: string | null;
  name: string | null;
  picture: string | null;
  date_of_birth: string | null;
  gender: string | null;
  profession: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  date_of_birth?: string | null;
  gender?: string | null;
  profession?: string | null;
}

export interface UsernameUpdate {
  username: string;
}