export type ConnectionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "blocked";

export interface ConnectionFriend {
  id: string;
  username: string;
  name: string | null;
  picture: string | null;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  friend: ConnectionFriend;
}

export interface ConnectionCreate {
  username: string;
}

export interface ConnectionStatusUpdate {
  status: "accepted" | "rejected" | "blocked";
}