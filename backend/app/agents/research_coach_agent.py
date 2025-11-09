import asyncio
from google.adk.agents import Agent  
from sqlalchemy.ext.asyncio import AsyncSession
import json
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
            "novelty": await novelty_analyzer(draft_text=draft_text, db=self.db),
            # "significance": await significance_analyzer(draft_text=draft_text, db=self.db)

        }
        print("\n novelty and significance \n")
        print(tasks)


        # Conditionally add methodology analysis to the task list
        if sections.has_methodology:
            tasks["methodology"] = await methodology_analyzer(draft_text=draft_text, db=self.db)
        
        print("\n methodology \n")
        print(tasks)

        return "coach agent response"