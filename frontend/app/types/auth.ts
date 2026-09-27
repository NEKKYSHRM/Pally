export interface User {
  id: string;
  username: string | null;
  email: string;
  name: string;
  picture?: string;
}

export interface TokenResponse {
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}