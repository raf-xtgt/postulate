import asyncio
from google.adk.agents import Agent  
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge_graph.agent_response import (
    SequenceClassificationResponse,
    ResearchCoachResponse,
    MethodologyAnalysis,
)
from app.agents.adk_tools import (
    novelty_analyzer,
    methodology_analyzer,
    significance_analyzer,
    contradiction_detector,
)

class ResearchCoachAgent(Agent):
    db: AsyncSession
    def __init__(self, db: AsyncSession, **kwargs):
        super().__init__(
            tools=[
                novelty_analyzer,
                methodology_analyzer,
                significance_analyzer,
                contradiction_detector,
            ],
            db=db,
            **kwargs
        )
  

    async def analyze_draft(self, classification_response: SequenceClassificationResponse) -> ResearchCoachResponse:
        """
        Analyzes a research draft for pitfalls and significance by conditionally running analysis tools.
        
        This agent orchestrates a series of specialized tools based on the initial
        classification of the draft's sections.
        """
        draft_text = classification_response.draft_text
        sections = classification_response.sections_present

        # --- Concurrently trigger the required analysis tools ---
        
        tasks = {
            "novelty": novelty_analyzer(draft_text=draft_text, db=self.db),
            "significance": significance_analyzer(draft_text=draft_text, db=self.db)
        }

        # Conditionally add methodology analysis to the task list
        if sections.has_methodology:
            tasks["methodology"] = methodology_analyzer(draft_text=draft_text, db=self.db)
        
        # Conditionally add contradiction detection to the task list
        if sections.has_results:
            tasks["contradictions"] = contradiction_detector(draft_text=draft_text, db=self.db)

        # Await all selected tasks to run in parallel
        results = await asyncio.gather(*tasks.values())
        
        # Map results back to their keys
        analysis_results = dict(zip(tasks.keys(), results))

        # --- Assemble the final response from the tool outputs ---

        # Methodology is optional, so we get it from the dict if it exists
        methodology_result = analysis_results.get("methodology")
        
        # Contradictions are also optional
        contradiction_result = analysis_results.get("contradictions", [])

        final_response = ResearchCoachResponse(
            draft_text=draft_text,
            novelty_analysis=analysis_results["novelty"],
            significance_analysis=analysis_results["significance"],
            methodology_analysis=methodology_result,
            contradiction_alerts=contradiction_result,
        )

        return final_response