import type { Pet, PetCreate, PetUpdate } from "@/app/types/pet";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken(): Promise<string> {
  const { store } = await import("@/app/store/store");

  const token = store.getState().auth.accessToken;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return token;
}

async function petRequest<T>(
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
    let errorMessage = "Pet request failed";

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
// Create Pally
// ---------------------------------------------------------------

export async function createPet(petData: PetCreate): Promise<Pet> {
  return petRequest<Pet>("/pet", {
    method: "POST",
    body: JSON.stringify(petData),
  });
}


// ---------------------------------------------------------------
// Get current user's Pally
// ---------------------------------------------------------------

export async function getPet(): Promise<Pet> {
  return petRequest<Pet>("/pet", {
    method: "GET",
  });
}


// ---------------------------------------------------------------
// Update Pally
// ---------------------------------------------------------------

export async function updatePet(petData: PetUpdate): Promise<Pet> {
  return petRequest<Pet>("/pet", {
    method: "PATCH",
    body: JSON.stringify(petData),
  });
}


// ---------------------------------------------------------------
// Delete Pally
// ---------------------------------------------------------------

export async function deletePet(): Promise<{ message: string }> {
  return petRequest<{ message: string }>("/pet", {
    method: "DELETE",
  });
}