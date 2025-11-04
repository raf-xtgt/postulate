from pydantic import BaseModel, Field
from typing import List, Literal, Optional


# --- Round 1 Schema ---
class PaperDetails(BaseModel):
    """Metadata for the main research paper."""
    title: str = Field(description="The full title of the research paper.")
    authors: List[str] = Field(description="A list of all author names.")
    publication_venue: Optional[str] = Field(description="The journal, conference, or publication venue." )
    year: Optional[int] = Field(description="The publication year." )

# --- Round 2 Schema ---
class SectionChunk(BaseModel):
    """A single section of the research paper."""
    section_title: str = Field(description="The title of this section (e.g., 'Introduction', 'Methodology').")
    section_text: str = Field(description="The full text content of this section.")

class SectionSummary(BaseModel):
    """A summary of a given section."""
    summary: str = Field(description="A concise summary of the entire section's content.")

# --- Round 3 Schema ---
# Entity and Relationship types from Postulate.md
ENTITY_TYPES = Literal[
    "Methodology", "Claim", "Result", "Key Concept", "Experiment", 
    "Terminology", "Limitation", "Future Work", "Hypothesis", 
    "Challenge", "Metric", "Citation"
]

RELATIONSHIP_TYPES = Literal[
    "USES", "STATES", "PRESENTS", "DISCUSSES", "INVOLVES", "USES_TERM", 
    "DEFINES", "IDENTIFIES", "SUGGESTS", "CITES"
]

class ClassifiedEntity(BaseModel):
    """An entity classified from a paragraph."""
    entity_type: ENTITY_TYPES = Field(description="The type of the classified entity.")
    relationship_type: RELATIONSHIP_TYPES = Field(description="The relationship from the paragraph to this entity.")
    name: str = Field(description="A short name for this entity (e.g., 'SVM', 'Main Claim', 'p-value', 'Author et al. [2023]').")
    content: str = Field(description="A summary of the entity's content as discussed in the paragraph, or the full citation text if it's a 'Citation'.")

class ParagraphAnalysis(BaseModel):
    """Analysis of a single paragraph, extracting multiple entities."""
    classified_entities: List[ClassifiedEntity] = Field(description="A list of all entities and relationships found in the paragraph.")

# --- Round 4 Schema ---
class ReferenceDetails(BaseModel):
    """Parsed details of a cited reference."""
    title: str = Field(description="The full title of the research paper.")
    authors: List[str] = Field(description="A list of all author names.")
    publication_venue: Optional[str] = Field(description="The journal, conference, or publication venue." )
    year: Optional[int] = Field(description="The publication year." )
