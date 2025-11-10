import asyncio
from google.adk.agents import Agent  
from sqlalchemy.ext.asyncio import AsyncSession
import json
from app.models.knowledge_graph.agent_response import (
    SequenceClassificationResponse,
    ResearchCoachResponse,
    MethodologyAnalysis,
    NoveltyAnalysis,
    SignificanceAnalysis,
    ContradictionListResponse,
    MethodologyAnalysisOutput,
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
        }

        # Conditionally add methodology analysis to the task list
        if sections.has_methodology:
            tasks["methodology"] = await methodology_analyzer(draft_text=draft_text, db=self.db)
        
        if sections.has_results:
            tasks["contradictions"] = await contradiction_detector(draft_text=draft_text, db=self.db)

        print("\n tasks \n")
        print(tasks)
        
        # --- Map tasks dict to ResearchCoachResponse model ---
        
        # Safely extract and validate novelty analysis
        novelty_data = tasks.get("novelty")
        novelty_analysis = None
        if novelty_data:
            try:
                if isinstance(novelty_data, NoveltyAnalysis):
                    novelty_analysis = novelty_data
                elif isinstance(novelty_data, dict):
                    novelty_analysis = NoveltyAnalysis(**novelty_data)
            except Exception as e:
                print(f"Error parsing novelty analysis: {e}")
        
        # Safely extract and validate methodology analysis
        methodology_data = tasks.get("methodology")
        methodology_analysis = None
        if methodology_data:
            try:
                if isinstance(methodology_data, MethodologyAnalysisOutput):
                    methodology_analysis = methodology_data
                elif isinstance(methodology_data, dict):
                    methodology_analysis = MethodologyAnalysisOutput(**methodology_data)
            except Exception as e:
                print(f"Error parsing methodology analysis: {e}")
        
        # Safely extract and validate significance analysis
        significance_data = tasks.get("significance")
        significance_analysis = None
        if significance_data:
            try:
                if isinstance(significance_data, SignificanceAnalysis):
                    significance_analysis = significance_data
                elif isinstance(significance_data, dict):
                    significance_analysis = SignificanceAnalysis(**significance_data)
            except Exception as e:
                print(f"Error parsing significance analysis: {e}")
        
        # Safely extract and validate contradiction alerts
        contradictions_data = tasks.get("contradictions")
        contradiction_alerts = None
        if contradictions_data:
            try:
                if isinstance(contradictions_data, ContradictionListResponse):
                    contradiction_alerts = contradictions_data
                elif isinstance(contradictions_data, dict):
                    contradiction_alerts = ContradictionListResponse(**contradictions_data)
            except Exception as e:
                print(f"Error parsing contradiction alerts: {e}")
        
        # Build and return the ResearchCoachResponse
        response = ResearchCoachResponse(
            draft_text=draft_text,
            novelty_analysis=novelty_analysis,
            methodology_analysis=methodology_analysis,
            significance_analysis=significance_analysis,
            contradiction_alerts=contradiction_alerts
        )
        
        return response