export interface Conversation {
  id: string;
  participant_ids: string[];
  is_active: boolean;
  context_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  participant_ids: string[];
}

export interface ConversationUpdate {
  is_active?: boolean;
  context_summary?: string;
}