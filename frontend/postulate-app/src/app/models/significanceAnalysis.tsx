export interface SignificanceAnalysisModel {
  guid: string;
  session_guid: string;
  status: string | null;
  significance: string | null;
  feedback: string[] | null;
  created_date: string;
}
