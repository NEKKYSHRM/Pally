import type {
  User,
  UserProfileUpdate,
} from "@/app/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken(): Promise<string> {
  const { store } = await import("@/app/store/store");

  const token = store.getState().auth.accessToken;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return token;
}

async function userRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = "User request failed";

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(errorMessage);
  }

  return response.json();
}


// ---------------------------------------------------------------
// Get current user
// ---------------------------------------------------------------

export async function getUser(): Promise<User> {
  return userRequest<User>("/user/me", {
    method: "GET",
  });
}


// ---------------------------------------------------------------
// Update current user's profile
// ---------------------------------------------------------------

export async function updateUserProfile(
  profileData: UserProfileUpdate
): Promise<User> {
  return userRequest<User>("/user/profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
}


// ---------------------------------------------------------------
// Update username
// ---------------------------------------------------------------

export async function updateUsername(
  username: string
): Promise<User> {
  return userRequest<User>("/user/username", {
    method: "PATCH",
    body: JSON.stringify({
      username,
    }),
  });
}