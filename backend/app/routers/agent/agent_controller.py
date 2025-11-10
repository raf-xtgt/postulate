from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db_config import get_db
from app.models.knowledge_graph.api_dto import CitationDto, PitfallDto
from app.models.knowledge_graph.agent_response import ResearchCoachResponse, SignificanceAnalysis
from app.models.pitfall.ps_pitfall import PSPitfallCreate, PSPitfall
from app.models.significance.ps_significance_analysis import PSSignificanceAnalysisCreate, PSSignificanceAnalysis
from app.services.pitfall.pitfall_service import PitfallService
from app.services.significance.significance_analysis_service import SignificanceAnalysisService
from app.agents.section_classifier_agent import SectionClassifierAgent
from app.agents.research_coach_agent import ResearchCoachAgent
from app.agents.contribution_clarification_agent import ContributionClarificationAgent
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


@router.post("/pitfall-analysis", response_model=PSPitfall)
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
    3.  **Saves the analysis**: Stores the pitfall analysis in the database.
    """
    # Step 1: Trigger the Section Classifier Agent to understand the draft's structure.
    section_classifier = SectionClassifierAgent(name="section_classifier_agent", kg_helper_service=KGHelperService())
    classification_response = await section_classifier.classify_sections(draft_text.draft_paper)
    print("classification response", classification_response.sections_present)
    
    # Step 2: Pass the structured information to the Research Coach Agent for deep analysis.
    research_coach = ResearchCoachAgent(db=dbConn, name="research_coach_agent")
    final_analysis = await research_coach.analyze_draft(classification_response)
    
    # Step 3: Create a pitfall record in the database
    pitfall_service = PitfallService()
    pitfall_create = PSPitfallCreate(
        session_guid=draft_text.session_guid,
        draft_text=final_analysis.draft_text[:1000],
        novelty_analysis=final_analysis.novelty_analysis,
        methodology_analysis=final_analysis.methodology_analysis,
        significance_analysis=final_analysis.significance_analysis,
        contradiction_alerts=final_analysis.contradiction_alerts
    )
    
    pitfall_record = await pitfall_service.create_pitfall(db=dbConn, pitfall=pitfall_create)
    
    return pitfall_record


@router.post("/significance-clarification", response_model=PSSignificanceAnalysis)
async def search_for_significance_clarification(
    draft_text: PitfallDto,
    dbConn: AsyncSession = Depends(get_db)
):
    """
    Triggers the significance clarification agent to analyze research contribution.
    
    This endpoint:
    1. Runs the Contribution Clarification Agent to assess significance
    2. Stores the significance analysis in the database
    3. Returns the created significance analysis record
    """
    # Step 1: Run the Contribution Clarification Agent
    contribution_agent = ContributionClarificationAgent(db=dbConn, name="contribution_clarification_agent")
    final_analysis = await contribution_agent.analyze_draft(draft_text.draft_paper)
    
    # Step 2: Extract significance analysis from the result
    significance_data = final_analysis.get("significance")
    
    # Step 3: Create a significance analysis record in the database
    significance_service = SignificanceAnalysisService()
    
    # Parse the significance data
    if significance_data:
        if isinstance(significance_data, SignificanceAnalysis):
            significance_create = PSSignificanceAnalysisCreate(
                session_guid=draft_text.session_guid,
                status=significance_data.status,
                significance=significance_data.significance,
                feedback=significance_data.feedback
            )
        elif isinstance(significance_data, dict):
            significance_create = PSSignificanceAnalysisCreate(
                session_guid=draft_text.session_guid,
                status=significance_data.get("status"),
                significance=significance_data.get("significance"),
                feedback=significance_data.get("feedback")
            )
        else:
            # Fallback if data format is unexpected
            significance_create = PSSignificanceAnalysisCreate(
                session_guid=draft_text.session_guid,
                status=None,
                significance=None,
                feedback=None
            )
    else:
        # No significance data returned
        significance_create = PSSignificanceAnalysisCreate(
            session_guid=draft_text.session_guid,
            status=None,
            significance=None,
            feedback=None
        )
    
    significance_record = await significance_service.create_significance_analysis(
        db=dbConn, 
        significance_analysis=significance_create
    )
    
    return significance_record