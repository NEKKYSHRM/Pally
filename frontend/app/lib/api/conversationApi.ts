import type {
  Conversation,
  ConversationCreate,
  ConversationUpdate,
} from "@/app/types/conversation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken(): Promise<string> {
  const { store } = await import("@/app/store/store");

  const token = store.getState().auth.accessToken;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return token;
}

async function conversationRequest<T>(
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
    let errorMessage = "Conversation request failed";

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
// Create Conversation
// ---------------------------------------------------------------

export async function createConversation(
  conversationData: ConversationCreate
): Promise<Conversation> {
  return conversationRequest<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify(conversationData),
  });
}


// ---------------------------------------------------------------
// Get or Create Conversation With Friend
// ---------------------------------------------------------------

export async function getOrCreateConversation(
  friendId: string
): Promise<Conversation> {
  return conversationRequest<Conversation>(
    `/conversations/with/${friendId}`,
    {
      method: "POST",
    }
  );
}


// ---------------------------------------------------------------
// Get User Conversations
// ---------------------------------------------------------------

export async function getConversations(): Promise<Conversation[]> {
  return conversationRequest<Conversation[]>("/conversations", {
    method: "GET",
  });
}


// ---------------------------------------------------------------
// Get Single Conversation
// ---------------------------------------------------------------

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  return conversationRequest<Conversation>(
    `/conversations/${conversationId}`,
    {
      method: "GET",
    }
  );
}


// ---------------------------------------------------------------
// Update Conversation
// ---------------------------------------------------------------

export async function updateConversation(
  conversationId: string,
  conversationData: ConversationUpdate
): Promise<Conversation> {
  return conversationRequest<Conversation>(
    `/conversations/${conversationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(conversationData),
    }
  );
}


// ---------------------------------------------------------------
// Delete Conversation
// ---------------------------------------------------------------

export async function deleteConversation(
  conversationId: string
): Promise<{ message: string }> {
  return conversationRequest<{ message: string }>(
    `/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );
}