from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from app.services.knowledge_graph.kg_search_service import KGSearchService
from app.services.knowledge_graph.kg_helper_service import KGHelperService
from app.models.knowledge_graph.agent_response import (
    NoveltyAnalysis,
    MethodologyAnalysis,
    SignificanceAnalysis,
    ContradictionAnalysis,
    ContradictionListResponse,
    MethodologyAnalysisOutput
)
from app.models.knowledge_graph.agent_dto import *

# Initialize the services to be used by all tools
kg_helper_service = KGHelperService()
kg_search_service = KGSearchService()



async def novelty_analyzer(draft_text: str, db: AsyncSession):
    """
    Analyzes the novelty of the main claim in a research draft.
    It extracts the core claim, searches for related concepts in the knowledge graph,
    and then uses an LLM to score the novelty and provide feedback.
    """
    # 1. Understand: Extract the main claim from the draft.
    claim_extraction_prompt = f"""
    Analyze the following research draft and extract the single, most important claim or finding.
    Respond with a JSON object with a single key "response".
    Draft:
    ---
    {draft_text}
    ---
    What is the primary claim?
    """
    main_claim_response = await kg_helper_service._generate_structured_content(
        claim_extraction_prompt, 
        response_model=SingleStringResponse
    )
    main_claim = main_claim_response.response if main_claim_response else ""
    print("main claim")
    print(main_claim)

    # # 2. Search: Find related information in the knowledge graph.
    context_from_kg = await kg_search_service.search_and_explain(main_claim, db)
    print("\nKG search against main claim")
    
    # Take only the first 3 items if there are more than 3
    context_limited = context_from_kg[:3] if len(context_from_kg) > 3 else context_from_kg

    # Join them into a single string separated by newlines
    context_str = "\n".join(context_limited)
    print(context_str)

    # 3. Compare: Use LLM to judge novelty based on the claim and KG context.
    judgement_prompt = f"""
    You are an expert peer reviewer. Your task is to assess the novelty of a research claim based on existing literature.

    Research Claim: "{main_claim}"

    Existing Knowledge from Corpus as context:
    ---
    {context_str}
    ---

    Based on the existing knowledge, assess the novelty of the research claim. 
    Apply a score between 0.0 and 1.0 where a higher score means highly novel.
    Provide a clear, actionable feedback for the provided score.

    """
    novelty_analysis = await kg_helper_service._generate_structured_content(
        judgement_prompt, 
        response_model=NoveltyAnalysis
    )
    
    if (novelty_analysis) and (novelty_analysis.supporting_claim_text is not None):
        # Ensure the supporting text is the claim we identified
        novelty_analysis.supporting_claim_text = main_claim.strip()
    else:
        # Handle error case, return a default/empty analysis
        novelty_analysis = NoveltyAnalysis(score=0, feedback="Analysis failed.", supporting_claim_text=main_claim.strip())
    
    return novelty_analysis

async def methodology_analyzer(draft_text: str, db: AsyncSession) -> MethodologyAnalysisOutput:
    """
    Analyzes the alignment between the methodology and claims in a research draft.
    It extracts both components, searches for context, and uses an LLM to assess alignment.
    """
    # 1. Understand: Extract methodology and claim.
    extraction_prompt = f"""
    From the draft below, extract the methodology and the main claim it supports.
    Draft:
    ---
    {draft_text}
    ---
    Respond with a JSON object with keys "method_text" and "claim_text".
    """
    extracted_texts = await kg_helper_service._generate_structured_content(
        extraction_prompt, 
        response_model=MethodClaimResponse
    )
    method_text = extracted_texts.method_text if extracted_texts else ""
    claim_text = extracted_texts.claim_text if extracted_texts else ""

    # 2. Search: Find related information for both method and claim.
    method_context = await kg_search_service.search_and_explain(method_text, db)
    claim_context = await kg_search_service.search_and_explain(claim_text, db)
    context_str = "Method Context:\n" + "\n".join(method_context) + "\n\nClaim Context:\n" + "\n".join(claim_context)

    # 3. Compare: Use LLM to judge alignment.
    judgement_prompt = f"""
    As a peer reviewer, assess if the described methodology logically supports the stated claim.

    Methodology: "{method_text}"
    Claim: "{claim_text}"

    Context from similar papers:
    ---
    {context_str}
    ---

    Does the methodology align with the claim? Provide a clear, actionable feedback for the provided status. 
    Apply one of the following status to the claim : 'aligned', 'misaligned' , 'unclear'.    
    """
    methodology_analysis = await kg_helper_service._generate_structured_content(
        judgement_prompt, 
        response_model=MethodologyAnalysis
    )
    output = MethodologyAnalysisOutput(method_text="", claim_text="", status="", feedback="")
    if methodology_analysis:
        output.method_text = method_text
        output.claim_text = claim_text
        output.status = methodology_analysis.status
        output.feedback = methodology_analysis.feedback
    else:
        methodology_analysis = MethodologyAnalysisOutput(
            is_aligned=False,
            feedback="Analysis failed.",
            method_text=method_text,
            claim_text=claim_text
        )
    return output


async def significance_analyzer(draft_text: str, db: AsyncSession) -> SignificanceAnalysis:
    """
    Assesses if the research draft clearly articulates its significance or contribution.
    It looks for impact statements, searches for context on the research gap, and provides feedback.
    """
    # 1. Understand: Extract the contribution statement.
    extraction_prompt = f"""
    What is the stated contribution or the significance or the draft below? Identify the text answering: "Why does the research matter?"
    Draft:
    ---
    {draft_text}
    ---
    Extract the sentence(s) that describe the significance. Respond with a JSON object with a single key "response".
    """
    contribution_text_response = await kg_helper_service._generate_structured_content(
        extraction_prompt, 
        response_model=SingleStringResponse
    )
    contribution_text = contribution_text_response.response if contribution_text_response else ""

    # 3. Compare: Use LLM to judge the clarity and impact of the contribution.
    judgement_prompt = f"""
    You are an expert academic reviewer. Your task is to analyze the provided draft of a research paper, specifically focusing on how effectively it addresses the question: "**Why does this research matter?**" and highlights its **significance**.
    
    Draft:
    ---
    {draft_text}
    ---
    Stated Contribution: "{contribution_text}"

    **Analysis Criteria:**
    1.  **Clarity:** Is the significance immediately obvious to the reader?
    2.  **Impact:** Does the paper explain *who* will benefit and *how* they will benefit (e.g., theoretically, methodologically, practically, or for policy)?
    3.  **Scope:** Does the paper adequately explain how the research fills a gap or solves a problem described in the introduction/literature review?

    """
    significance_analysis = await kg_helper_service._generate_structured_content(
        judgement_prompt, 
        response_model=SignificanceAnalysis
    )
    if not significance_analysis:
        significance_analysis = SignificanceAnalysis(
            status=None,
            feedback="Analysis failed.",
            significance=None
        )
    return significance_analysis


async def contradiction_detector(draft_text: str, db: AsyncSession) -> ContradictionListResponse:
    """
    Detects direct contradictions between claims in the draft and the existing knowledge graph.
    It extracts claims, searches for conflicting information, and reports any discrepancies.
    """
    # 1. Understand: Extract all key claims from the draft.
    extraction_prompt = f"""
    Extract all distinct claims or findings from the research draft below.
    Draft:
    ---
    {draft_text}
    ---
    Return a JSON object with a "claims" key containing a list of maximum 5 strings, where each string is a claim.
    """
    claims_response = await kg_helper_service._generate_structured_content(
        extraction_prompt, 
        response_model=ClaimListResponse
    )
    claims = claims_response.claims if claims_response else []

    all_contradictions = []
    for claim in claims:
        # 2. Search: Find potentially contradictory information.
        # We frame the search query to look for opposing views.
        search_query = claim
        context_from_kg = await kg_search_service.search_and_explain(search_query, db)
        
        if not context_from_kg or "No matching paragraphs" in context_from_kg[0]:
            continue
            
        context_str = "\n".join(context_from_kg)

        # 3. Compare: Use LLM to identify and format direct contradictions.
        judgement_prompt = f"""
        You are a meticulous fact-checker. Does the context below directly contradict the research claim?

        Research Claim: "{claim}"

        Context from Corpus:
        ---
        {context_str}
        ---
        Identify the paper title in the corpus that catches the contradiction or conflict.
        Provide a helpful feedback explaining the conflict or contradiction.
        Highlight the contradictory finding or text from the corpus.
        """
        # We expect a list of contradictions, as one claim might contradict multiple sources.
        contradictions_response = await kg_helper_service._generate_structured_content(
            judgement_prompt, 
            response_model=ContradictionAnalysis
        )
        contradictions_response.draft_finding = claim

        if contradictions_response:
            all_contradictions.append(contradictions_response)
        
    return ContradictionListResponse(contradictions=all_contradictions)
