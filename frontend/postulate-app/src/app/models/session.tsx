import { ClientAgentContextModel } from "./clientAgent";

export interface SessionModel {
    session_id: string;
    client_agent_context: ClientAgentContextModel;
    round_count: number;
  }
  

export enum SessionOutcomeEnum {
  IN_PROGRESS = "In Progress",
  SUCCESS = "Success",
  FAILED = "Failed",
}
  