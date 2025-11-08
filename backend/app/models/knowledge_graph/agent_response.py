from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict
from typing import Dict, Any

## Section Presence Helper Model
class SectionsPresent(BaseModel):
    """Boolean flags indicating the presence of common research paper sections."""
    has_methodology: bool
    has_results: bool
    has_citations: bool
    has_introduction: bool
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'has_methodology': {'description': 'True if a distinct "Methodology" or "Experiment" or a similar section is present.'},
                'has_results': {'description': 'True if a distinct "Results" or "Findings" or "Claims" or a similar section is present.'},
                'has_citations': {'description': 'True if citations (e.g., [1], Author et al.) or similar are found in the text.'},
                'has_introduction': {'description': 'True if a distinct "Introduction" or "Abstract" section is present.'},
            }
        }
    )

## Main Draft Analysis Model
class SequenceClassificationResponse(BaseModel):
    """An initial analysis of a document draft, including the raw text and section presence."""
    draft_text: str
    sections_present: SectionsPresent
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'draft_text': {'description': 'The complete or partial text content of the draft document.'},
                'sections_present': {'description': 'A dictionary containing boolean flags about the structural content of the draft.'},
            }
        }
    )


# --- Individual Analysis Models ---

class NoveltyAnalysis(BaseModel):
    """Provides a score and context for the novelty of claims in the draft."""
    status: Literal["novel", "iterative", "needs_review"] = Field(
        ..., 
        description="A high-level assessment of the finding's novelty."
    )
    score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="A score from 0.0 (not novel) to 1.0 (highly novel) based on the corpus."
    )
    message: str = Field(
        ..., 
        description="A clear, actionable message. E.g., 'This appears novel, but consider citing Y on similar methodology.'"
    )
    supporting_claim_text: Optional[str] = Field(
        None, 
        description="The specific text from the draft identified as the primary claim being scored."
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            'example': {
                'status': 'novel',
                'score': 0.85,
                'message': "This finding appears highly novel. Your claim about 'X' extends beyond the findings of Smith (2023) on similar methodology.",
                'supporting_claim_text': "Our new algorithm achieves 95% accuracy, a significant leap."
            }
        }
    )

class MethodologyAnalysis(BaseModel):
    """Analyzes the alignment between the described methodology and the research claims."""
    status: Literal["aligned", "misaligned", "unclear"] = Field(
        ..., 
        description="Assessment of whether the methods logically support the claims."
    )
    message: str = Field(
        ..., 
        description="Actionable feedback. E.g., 'This method is appropriate for X, but consider addressing limitation Y.'"
    )
    method_text: Optional[str] = Field(
        None, 
        description="The specific text from the draft identified as the methodology description."
    )
    claim_text: Optional[str] = Field(
        None, 
        description="The specific claim text this methodology is being compared against."
    )

    model_config = ConfigDict(
        json_schema_extra={
            'example': {
                'status': 'misaligned',
                'message': "The qualitative interview method described is appropriate for 'why' questions, but doesn't fully support your quantitative claim about 'how often' this occurs.",
                'method_text': "We conducted 10 semi-structured interviews...",
                'claim_text': "...proving this phenomenon is widespread."
            }
        }
    )

class ContradictionAnalysis(BaseModel):
    """Details a specific contradiction found between the draft and the cited corpus."""
    draft_finding: str = Field(
        ..., 
        description="The specific finding or claim text from the user's draft."
    )
    corpus_paper_id: str = Field(
        ..., 
        description="The identifier (e.g., 'Smith 2019' or a UUID) of the contradictory paper in the corpus."
    )
    corpus_finding: str = Field(
        ..., 
        description="The specific contradictory finding or text from the corpus paper."
    )
    message: str = Field(
        ..., 
        description="A helpful message explaining the conflict. E.g., 'This finding contradicts Smith 2019 on point Z.'"
    )

    model_config = ConfigDict(
        json_schema_extra={
            'example': {
                'draft_finding': "We found that X increases Y.",
                'corpus_paper_id': "Jones et al. 2022",
                'corpus_finding': "In our study, X was found to decrease Y under similar conditions.",
                'message': "Your finding that 'X increases Y' directly contradicts Jones et al. 2022, who found the opposite. Consider discussing this discrepancy."
            }
        }
    )

class SignificanceAnalysis(BaseModel):
    """Assesses whether the paper's 'why this matters' (contribution) is clearly stated."""
    status: Literal["clear", "weak", "missing"] = Field(
        ..., 
        description="Assessment of the contribution's clarity and impact."
    )
    message: str = Field(
        ..., 
        description="Feedback on strengthening the impact. E.g., 'The impact would be clearer if you contrast with current limitations.'"
    )
    supporting_text: Optional[str] = Field(
        None, 
        description="The specific text from the draft identified as the contribution/impact statement (or lack thereof)."
    )

    model_config = ConfigDict(
        json_schema_extra={
            'example': {
                'status': 'weak',
                'message': "The contribution is stated, but its impact would be clearer if you directly contrasted your results with the primary limitations in the field you're addressing.",
                'supporting_text': "This work provides a new method for analysis."
            }
        }
    )


# --- Main Research Coach Response Model ---

class ResearchCoachResponse(BaseModel):
    """
    The complete analysis report from the Research Coach AI Agent.
    This report identifies research pitfalls and assesses the draft's overall contribution.
    """
    
    # This field links the analysis to the specific input draft
    draft_text: str = Field(
        ...,
        description="The full draft text that was analyzed by the agent."
    )

    # The four analysis modes, matching the spec
    novelty_analysis: NoveltyAnalysis = Field(
        ...,
        description="Analysis of the draft's novelty compared to the corpus."
    )
    
    methodology_analysis: Optional[MethodologyAnalysis] = Field(
        None,
        description="Analysis of method-claim alignment. Null if 'has_methodology' was false."
    )
    
    significance_analysis: SignificanceAnalysis = Field(
        ...,
        description="Analysis of the draft's contribution and 'why it matters'."
    )
    
    contradiction_alerts: List[ContradictionAnalysis] = Field(
        default_factory=list,
        description="A list of specific contradictions found. Empty if 'has_results' was false or no contradictions were detected."
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            'title': 'Research Coach Agent Response',
            'description': "A comprehensive pitfall and contribution analysis for a research draft."
        }
    )