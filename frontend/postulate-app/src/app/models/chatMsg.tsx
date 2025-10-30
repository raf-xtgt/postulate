export interface ChatMessage {
    id: number;
    content: string;
    role: "salesman" | "client_agent";
    time: string;
  }

export interface ConversationFlow {
  message: string;
  speaker: string;
}

export interface AlternativePath {
  conversation_flow: ConversationFlow[];
  strategy:string;
  technique_used:string;
  rationale:string;
  expected_outcome:string;
}