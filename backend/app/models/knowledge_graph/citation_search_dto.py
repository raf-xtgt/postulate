from pydantic import BaseModel, Field
from typing import List


class RelatedEntity(BaseModel):
    """
    Represents a related entity found through knowledge graph traversal.
    
    Attributes:
        entity_type: The type of entity (Citation, Claim, Methodology, Result, Key Concept)
        content: The textual content of the entity
        relationship_type: The type of relationship connecting this entity to the source paragraph
                          (CITES, STATES, USES, PRESENTS, DISCUSSES)
    """
    entity_type: str = Field(
        ...,
        description="Type of the entity: Citation, Claim, Methodology, Result, or Key Concept"
    )
    content: str = Field(
        ...,
        description="The textual content of the entity"
    )
    relationship_type: str = Field(
        ...,
        description="Relationship type connecting to source: CITES, STATES, USES, PRESENTS, or DISCUSSES"
    )


class CitationResult(BaseModel):
    """
    Represents a single citation search result with paper metadata, paragraph context, and related entities.
    
    Attributes:
        paper_title: Title of the research paper
        paper_authors: Authors of the research paper
        paper_year: Publication year of the research paper
        paper_venue: Publication venue (journal/conference) of the research paper
        paragraph_text: The relevant paragraph text that matches the search query
        relevance_score: Numerical score indicating relevance to the search query (higher is more relevant)
        related_entities: List of related entities found through graph traversal from the paragraph
    """
    paper_title: str = Field(
        ...,
        description="Title of the research paper"
    )
    paper_authors: str = Field(
        ...,
        description="Authors of the research paper"
    )
    paper_year: str = Field(
        ...,
        description="Publication year of the research paper"
    )
    paper_venue: str = Field(
        ...,
        description="Publication venue (journal or conference) of the research paper"
    )
    paragraph_text: str = Field(
        ...,
        description="The relevant paragraph text matching the search query"
    )
    relevance_score: float = Field(
        ...,
        description="Relevance score for this result (higher values indicate better matches)"
    )
    related_entities: List[RelatedEntity] = Field(
        default_factory=list,
        description="List of related entities discovered through knowledge graph traversal"
    )
