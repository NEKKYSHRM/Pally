export type MessageSenderType = "user" | "pet";

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface MessageCreate {
  content: string;
}