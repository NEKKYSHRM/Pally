import type {
  Connection,
  ConnectionCreate,
  ConnectionStatusUpdate,
} from "@/app/types/connection";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken(): Promise<string> {
  const { store } = await import("@/app/store/store");

  const token = store.getState().auth.accessToken;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return token;
}

async function connectionRequest<T>(
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
    let errorMessage = "Connection request failed";

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
// Send Connection Request
// ---------------------------------------------------------------

export async function sendConnectionRequest(
  connectionData: ConnectionCreate
): Promise<Connection> {
  return connectionRequest<Connection>("/connections", {
    method: "POST",
    body: JSON.stringify(connectionData),
  });
}


// ---------------------------------------------------------------
// Get All Connections
// ---------------------------------------------------------------

export async function getConnections(): Promise<Connection[]> {
  return connectionRequest<Connection[]>("/connections", {
    method: "GET",
  });
}


// ---------------------------------------------------------------
// Get Received Pending Requests
// ---------------------------------------------------------------

export async function getReceivedConnectionRequests(): Promise<Connection[]> {
  return connectionRequest<Connection[]>(
    "/connections/requests/received",
    {
      method: "GET",
    }
  );
}


// ---------------------------------------------------------------
// Get Sent Pending Requests
// ---------------------------------------------------------------

export async function getSentConnectionRequests(): Promise<Connection[]> {
  return connectionRequest<Connection[]>(
    "/connections/requests/sent",
    {
      method: "GET",
    }
  );
}


// ---------------------------------------------------------------
// Get Single Connection
// ---------------------------------------------------------------

export async function getConnection(
  connectionId: string
): Promise<Connection> {
  return connectionRequest<Connection>(
    `/connections/${connectionId}`,
    {
      method: "GET",
    }
  );
}


// ---------------------------------------------------------------
// Update Connection Status
// ---------------------------------------------------------------

export async function updateConnectionStatus(
  connectionId: string,
  statusData: ConnectionStatusUpdate
): Promise<Connection> {
  return connectionRequest<Connection>(
    `/connections/${connectionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(statusData),
    }
  );
}


// ---------------------------------------------------------------
// Delete Connection
// ---------------------------------------------------------------

export async function deleteConnection(
  connectionId: string
): Promise<{ message: string }> {
  return connectionRequest<{ message: string }>(
    `/connections/${connectionId}`,
    {
      method: "DELETE",
    }
  );
}