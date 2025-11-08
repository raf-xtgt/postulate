from adk.agent import Agent
from adk.llm.vertex_ai_llm import VertexAILLM
from app.models.knowledge_graph.agent_response import SequenceClassificationResponse, SectionsPresent

class SectionClassifierAgent(Agent):
    def __init__(self, **kwargs):
        super().__init__(llm=VertexAILLM(), **kwargs)

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
        
        Based on your analysis, provide a boolean value for each section's presence.
        """
        
        # The `get_structured_response` method ensures the LLM output conforms to the `SectionsPresent` Pydantic model.
        sections_present = await self.llm.get_structured_response(
            prompt,
            response_model=SectionsPresent
        )
        
        # The final response bundles the original text with the classification results.
        return SequenceClassificationResponse(
            draft_text=draft_text,
            sections_present=sections_present
        )
