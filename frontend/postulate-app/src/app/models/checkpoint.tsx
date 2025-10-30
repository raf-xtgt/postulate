// src/app/models/checkpoint.ts
export interface ConversationFlowItem {
    message: string;
    speaker: string;
  }
  
  export interface AlternativePath {
    conversation_flow?: ConversationFlowItem[];
    expected_outcome?: string;
    rationale?: string;
    strategy?: string;
    technique_used?: string;
  }
  
  export interface BehavioralCue {
    cue_name?: string;
    evidence_quote?: string;
    impact_probability?: string;
    interpretation?: string;
  }
  
  export interface RiskItem {
    description?: string;
    impact?: string;
    impact_level?: string;
  }
  
  export interface CoachAgentIdentifiedIssues {
    behavioral?: {
      behavioral_cues?: BehavioralCue[];
    };
    risk?: {
      risks?: RiskItem[];
    };
  }
  
  export interface AlternatorAgentResponse {
    alternative_paths?: AlternativePath[];
    analysis?: {
      behavioral_insights?: string[];
      identified_issue?: string;
      original_user_statement?: string;
    };
  }
  
  export interface Checkpoint {
    alternator_agent_response?: AlternatorAgentResponse;
    checkpoint_list?: number[]; // optional
    client_agent_response?: { content?: string; role?: string };
    coach_agent_identified_issues?: CoachAgentIdentifiedIssues;
    coach_agent_report?: string;
    session_id?: string;
  }
  