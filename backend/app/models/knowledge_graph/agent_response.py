from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict
from typing import Dict, Any
from app.models.knowledge_graph.agent_response import *

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

class ContradictionListResponse(BaseModel):
    """A Pydantic model for a list of contradiction analyses."""
    contradictions: List[ContradictionAnalysis]

class SignificanceAnalysis(BaseModel):
    """Assesses whether the paper's 'why this matters' (contribution) is clearly stated."""
    status: None | str
    significance: None | str
    feedback: None | List[str]

    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'status': {'description': "Assessment of whether the the research significance is clearly and compellingly highlighted. Apply one of the following status: 'clear', 'weak', 'missing'."},
                'significance': {'description': "Concise reason for the provided status. "},
                'feedback': {'description': "A list of 2-3 specific, actionable steps to improve the clarity and impact of the research significance statement"} ,
            }
        }
    )


# --- Main Research Coach Response Model ---

class ResearchCoachResponse(BaseModel):
    """
    The complete analysis report from the Research Coach AI Agent.
    This report identifies research pitfalls and assesses the draft's overall contribution.
    """
    draft_text:  None | str 
    novelty_analysis: None | NoveltyAnalysis
    methodology_analysis: None | MethodologyAnalysisOutput
    significance_analysis:  None | SignificanceAnalysis
    contradiction_alerts: None | ContradictionListResponse 