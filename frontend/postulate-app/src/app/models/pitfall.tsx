export interface NoveltyAnalysis {
  score: number;
  feedback: string;
  supporting_claim_text: string | null;
}

export interface MethodologyAnalysisOutput {
  method_text: string | null;
  claim_text: string | null;
  status: string | null;
  feedback: string | null;
}

export interface SignificanceAnalysis {
  status: string | null;
  significance: string | null;
  feedback: string[] | null;
}

export interface ContradictionAnalysis {
  draft_finding: string | null;
  corpus_paper_id: string | null;
  corpus_finding: string | null;
  feedback: string | null;
}

export interface ContradictionListResponse {
  contradictions: ContradictionAnalysis[];
}

export interface PitfallModel {
  guid: string;
  session_guid: string;
  draft_text: string | null;
  novelty_analysis: NoveltyAnalysis | null;
  methodology_analysis: MethodologyAnalysisOutput | null;
  significance_analysis: SignificanceAnalysis | null;
  contradiction_alerts: ContradictionListResponse | null;
  created_date: string;
}