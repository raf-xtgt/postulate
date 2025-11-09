from google.adk.agents import Agent
from app.models.knowledge_graph.agent_response import SequenceClassificationResponse, SectionsPresent
from app.services.knowledge_graph.kg_helper_service import KGHelperService

class SectionClassifierAgent(Agent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.kg_helper_service = KGHelperService()

    async def classify_sections(self, draft_text: str) -> SequenceClassificationResponse:
        """
        Analyzes the draft text to classify which sections are present.
        The agent uses an LLM to determine the presence of key research paper sections.
        """
        
        # The prompt instructs the LLM to act as a classifier and return a specific JSON structure.
        prompt = f"""
        You are an expert research assistant. Your task is to analyze a research paper draft and identify which standard sections are present.

        Analyze the following draft text and determine if it contains content corresponding to:
        1.  **Methodology**: Describes how the research was conducted (e.g., "Methodology", "Experiment", "Procedure").
        2.  **Results**: Presents the findings of the research (e.g., "Results", "Findings", "Claims").
        3.  **Citations**: References other papers (e.g., formats like [1], (Smith, 2023)).
        4.  **Introduction**: Provides background and states the paper's purpose (e.g., "Introduction", "Abstract").

        Draft Text:
        ---
        {draft_text}
        ---
        
        Based on your analysis, provide a boolean value for each section's presence. Respond with a JSON object that conforms to the SectionsPresent schema.
        """
        
        # The `_generate_structured_content` method ensures the LLM output conforms to the `SectionsPresent` Pydantic model.
        sections_present = await self.kg_helper_service._generate_structured_content(
            prompt,
            response_model=SectionsPresent
        )

        if not sections_present:
            # If the call fails, assume no sections are present to avoid downstream errors
            sections_present = SectionsPresent(
                has_methodology=False,
                has_results=False,
                has_citations=False,
                has_introduction=False
            )
        
        # The final response bundles the original text with the classification results.
        return SequenceClassificationResponse(
            draft_text=draft_text,
            sections_present=sections_present
        )