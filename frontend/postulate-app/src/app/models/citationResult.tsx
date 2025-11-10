export interface CitationResultModel {
  guid: string;
  session_guid: string;
  paper_title: string | null;
  paper_authors: string | null;
  paper_year: string | null;
  paper_venue: string | null;
  paragraph_text: string | null;
  relevance_score: number | null;
  context_summary: string | null;
  created_date: string;
}
