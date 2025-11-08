from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional, Union # Optional is kept for ReferenceDetails year field for comparison

# --- Round 1 Schema ---
class PaperDetails(BaseModel):
    """Metadata for the main research paper."""
    title: str
    authors: List[str]
    publication_venue: None | str
    year: None | int
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'title': {'description': 'The full title of the research paper.'},
                'authors': {'description': 'A list of all author names.'},
                'publication_venue': {'description': 'The journal, conference, or publication venue.'},
                'year': {'description': 'The publication year.'},
            }
        }
    )

# --- Round 2 Schema ---
class SectionChunk(BaseModel):
    """A single section of the research paper."""
    section_title: str = Field(description="The title of this section (e.g., 'Introduction', 'Methodology').")
    section_text: None | str
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'section_text': {'description': 'The full text content of this section.'},
            }
        }
    )

class SectionChunkList(BaseModel):
    """A wrapper model to hold a list of SectionChunk items."""
    sections: List[SectionChunk]

class SectionSummary(BaseModel):
    """A summary of a given section."""
    summary: str = Field(description="A concise summary of the entire section's content.")


# --- Round 3 Schema ---
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
    name: None | str
    content: None | str
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'name': {'description': "A short name for this entity (e.g., 'SVM', 'Main Claim', 'p-value', 'Author et al. [2023]')."},
                'content': {'description': "A summary of the entity's content as discussed in the paragraph, or the full citation text if it's a 'Citation'."},
            }
        }
    )

class ParagraphAnalysis(BaseModel):
    """Analysis of a single paragraph, extracting multiple entities."""
    classified_entities: List[ClassifiedEntity] = Field(description="A list of all entities and relationships found in the paragraph.")

# --- Round 4 Schema ---
class ReferenceDetails(BaseModel):
    """Parsed details of a cited reference."""
    title: str = Field(description="The full title of the research paper.")
    authors: List[str] = Field(description="A list of all author names.")
    publication_venue: None | str
    year: None | int
    
    model_config = ConfigDict(
        json_schema_extra={
            'properties': {
                'publication_venue': {'description': 'The journal, conference, or publication venue.'},
                'year': {'description': 'The publication year.'},
            }
        }
    )