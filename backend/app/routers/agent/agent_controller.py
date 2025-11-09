from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db_config import get_db
from app.models.knowledge_graph.api_dto import CitationDto, PitfallDto
from app.models.knowledge_graph.agent_response import ResearchCoachResponse
from app.agents.section_classifier_agent import SectionClassifierAgent
from app.agents.research_coach_agent import ResearchCoachAgent
from app.services.knowledge_graph.kg_helper_service import KGHelperService
from app.agents.adk_tools import (
    novelty_analyzer,
    methodology_analyzer,
    significance_analyzer,
    contradiction_detector,
)
router = APIRouter(
    prefix="/agent",
    tags=["Agent"]
)

@router.post("/suggest-citation")
async def citation_search(
    draft_text: CitationDto,
    db: AsyncSession = Depends(get_db)
):
    # This endpoint is for the Citation AI agent, which is not yet implemented.
    return "Endpoint to trigger the citation agent"


@router.post("/pitfall-analysis", response_model=ResearchCoachResponse)
async def search_for_pitfalls(
    draft_text: PitfallDto,
    dbConn: AsyncSession = Depends(get_db)
):
    """
    Triggers the agentic workflow to analyze a research draft for pitfalls.
    
    This endpoint sequentially triggers two agents:
    1.  **Section Classifier Agent**: Identifies which sections are present in the draft.
    2.  **Research Coach AI Agent**: Uses the output of the first agent to
        conditionally run various analysis modes (Novelty, Methodology, etc.)
        to detect research pitfalls and assess significance.
    """
    # Step 1: Trigger the Section Classifier Agent to understand the draft's structure.
    section_classifier = SectionClassifierAgent(name="section_classifier_agent", kg_helper_service=KGHelperService())
    classification_response = await section_classifier.classify_sections(draft_text.draft_paper)
    print("classification response", classification_response.sections_present)
    
    # Step 2: Pass the structured information to the Research Coach Agent for deep analysis.
    research_coach = ResearchCoachAgent(db=dbConn, name="research_coach_agent")
    final_analysis = await research_coach.analyze_draft(classification_response)
    
    return final_analysis