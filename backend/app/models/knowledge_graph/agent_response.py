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
    score: float 
    feedback: str 
    supporting_claim_text: None | str
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'score': {'description': 'A score from 0.0 (not novel) to 1.0 (highly novel) based on the corpus.'},
                'feedback': {'description':"A clear, actionable feedback for the provided score. E.g., 'This appears novel, but consider citing Y on similar methodology.'"} ,
                'supporting_claim_text':  {'description':"The specific text from the draft identified as the primary claim being scored. E.g., Our new algorithm achieves '95%' accuracy, a significant leap. "} 
            }
        }
    )

class MethodologyAnalysis(BaseModel):
    """Analyzes the alignment between the described methodology and the research claims."""
    status: str
    feedback: str 
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'status': {'description': "Assessment of whether the methods logically support the claims. Apply one of the following status to the claim : 'aligned', 'misaligned' , 'unclear'."},
                'feedback': {'description': "Your feedback on the question: Does the methodology align with the claim? "} ,
                
            }
        }
    )

class MethodologyAnalysisOutput(BaseModel):
    """Analyzes the alignment between the described methodology and the research claims."""
    method_text:  None | str 
    claim_text:  None | str
    status:  None | str
    feedback:  None | str 

class ContradictionAnalysis(BaseModel):
    """Details a specific contradiction found between the draft and the cited corpus."""
    draft_finding: None | str 
    corpus_paper_id: None | str 
    corpus_finding: None | str
    feedback: None | str

    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'draft_finding': {'description': "The specific finding or claim text from the user's draft paper. E.g.,'We found that X increases Y." },
                'corpus_paper_id': {'description': "The name of the contradictory paper from the corpus."},
                'feedback': {'description': "A helpful feedback explaining the conflict. E.g., 'This finding contradicts Smith 2019 on point Z.'"} ,
                'corpus_finding': {'description': "The specific contradictory finding or text from the corpus paper."}
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
    
    methodology_analysis: Optional[MethodologyAnalysisOutput] = Field(
        None,
        description="Analysis of method-claim alignment. Null if 'has_methodology' was false."
    )
    
    significance_analysis: Optional[SignificanceAnalysis] = Field(
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