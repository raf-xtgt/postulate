export interface ClientAgentScore {
    score: number;
  }
  
  export interface ClientAgentRoundEval {
    objection_handling: ClientAgentScore;
    rapport_building: ClientAgentScore;
    clarity_and_conciseness: ClientAgentScore;
    persuasiveness: ClientAgentScore;
  }
  
  export interface ClientAgentInternalScore {
    scores: ClientAgentRoundEval;
    outcome: string;
    justification: string;
    msg_index: number;
  }
  
  export interface ClientAgentContextModel {
    profile_desc: string;
    current_objection: string;
    all_objections: string[]; // list of all client objections
    related_objections: string[]; // objections not raised but related
    conversation_history?: Record<string, any>[]; // optional list of dicts
    internal_scores?: ClientAgentInternalScore[]; // optional list of internal scores
  }
