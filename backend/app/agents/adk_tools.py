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
)

# Initialize the services to be used by all tools
kg_helper_service = KGHelperService()
kg_search_service = KGSearchService()

# Pydantic models for structured responses from the LLM
class SingleStringResponse(BaseModel):
    """A Pydantic model for a single string response."""
    response: str

class MethodClaimResponse(BaseModel):
    """A Pydantic model for extracting method and claim text."""
    method_text: str
    claim_text: str

class ClaimListResponse(BaseModel):
    """A Pydantic model for a list of claims."""
    claims: List[str]

class ContradictionListResponse(BaseModel):
    """A Pydantic model for a list of contradiction analyses."""
    contradictions: List[ContradictionAnalysis]

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
    for c in context_from_kg:
        print(c)
        print("\n")
    # context_str = "\n".join(context_from_kg)
    # print(context_str)

    # # 3. Compare: Use LLM to judge novelty based on the claim and KG context.
    # judgement_prompt = f"""
    # You are an expert peer reviewer. Your task is to assess the novelty of a research claim based on existing literature.

    # Research Claim: "{main_claim}"

    # Existing Knowledge from Corpus:
    # ---
    # {context_str}
    # ---

    # Based on the existing knowledge, assess the novelty of the research claim.
    # Respond with a JSON object that conforms to the NoveltyAnalysis schema.
    # """
    # novelty_analysis = await kg_helper_service._generate_structured_content(
    #     judgement_prompt, 
    #     response_model=NoveltyAnalysis
    # )
    
    # if novelty_analysis:
    #     # Ensure the supporting text is the claim we identified
    #     novelty_analysis.supporting_claim_text = main_claim.strip()
    # else:
    #     # Handle error case, return a default/empty analysis
    #     novelty_analysis = NoveltyAnalysis(score=0, feedback="Analysis failed.", supporting_claim_text=main_claim.strip())
    
    # return novelty_analysis
    return "novelty"

async def methodology_analyzer(draft_text: str, db: AsyncSession) -> MethodologyAnalysis:
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

    Does the methodology align with the claim? Respond with a JSON object that conforms to the MethodologyAnalysis schema.
    """
    methodology_analysis = await kg_helper_service._generate_structured_content(
        judgement_prompt, 
        response_model=MethodologyAnalysis
    )
    if methodology_analysis:
        methodology_analysis.method_text = method_text
        methodology_analysis.claim_text = claim_text
    else:
        methodology_analysis = MethodologyAnalysis(
            is_aligned=False,
            feedback="Analysis failed.",
            method_text=method_text,
            claim_text=claim_text
        )
    return methodology_analysis


async def significance_analyzer(draft_text: str, db: AsyncSession) -> SignificanceAnalysis:
    """
    Assesses if the research draft clearly articulates its significance or contribution.
    It looks for impact statements, searches for context on the research gap, and provides feedback.
    """
    # 1. Understand: Extract the contribution statement.
    extraction_prompt = f"""
    What is the stated contribution or "why this matters" in the draft below?
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

    # 2. Search: Find context about the research area/problem.
    context_from_kg = await kg_search_service.search_and_explain(contribution_text or draft_text, db)
    context_str = "\n".join(context_from_kg)

    # 3. Compare: Use LLM to judge the clarity and impact of the contribution.
    judgement_prompt = f"""
    You are a journal editor. Is the significance of the following research clear and impactful?

    Stated Contribution: "{contribution_text}"

    Context from the field:
    ---
    {context_str}
    ---

    Assess the significance. Respond with a JSON object that conforms to the SignificanceAnalysis schema.
    """
    significance_analysis = await kg_helper_service._generate_structured_content(
        judgement_prompt, 
        response_model=SignificanceAnalysis
    )
    if significance_analysis:
        significance_analysis.supporting_text = contribution_text.strip()
    else:
        significance_analysis = SignificanceAnalysis(
            is_clear=False,
            feedback="Analysis failed.",
            supporting_text=contribution_text.strip()
        )
    return significance_analysis


async def contradiction_detector(draft_text: str, db: AsyncSession) -> list[ContradictionAnalysis]:
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
    Return a JSON object with a "claims" key containing a list of strings, where each string is a claim.
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
        search_query = f"Find evidence that contradicts the claim: '{claim}'"
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

        If there is a direct contradiction, create a list of JSON objects describing it. If not, return an empty list for the 'contradictions' key.
        Respond with a JSON object with a "contradictions" key, where the value is a list of objects conforming to the ContradictionAnalysis schema.
        For each contradiction, identify the draft finding, the corpus paper ID (if available in the context), the corpus finding, and a message.
        """
        # We expect a list of contradictions, as one claim might contradict multiple sources.
        contradictions_response = await kg_helper_service._generate_structured_content(
            judgement_prompt, 
            response_model=ContradictionListResponse
        )
        if contradictions_response and contradictions_response.contradictions:
            all_contradictions.extend(contradictions_response.contradictions)
        
    return all_contradictions