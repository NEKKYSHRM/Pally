import type { Message, MessageCreate } from "@/app/types/message";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken(): Promise<string> {
  const { store } = await import("@/app/store/store");

  const token = store.getState().auth.accessToken;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return token;
}

async function messageRequest<T>(
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
    let errorMessage = "Message request failed";

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
// Send Message
// ---------------------------------------------------------------

export async function sendMessage(
  conversationId: string,
  messageData: MessageCreate
): Promise<Message> {
  return messageRequest<Message>(
    `/messages/${conversationId}`,
    {
      method: "POST",
      body: JSON.stringify(messageData),
    }
  );
}


// ---------------------------------------------------------------
// Get All Conversation Messages
// ---------------------------------------------------------------

export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  return messageRequest<Message[]>(
    `/messages/${conversationId}`,
    {
      method: "GET",
    }
  );
}


// ---------------------------------------------------------------
// Get Recent Conversation Messages
// ---------------------------------------------------------------

export async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  return messageRequest<Message[]>(
    `/messages/${conversationId}/recent?limit=${limit}`,
    {
      method: "GET",
    }
  );
}