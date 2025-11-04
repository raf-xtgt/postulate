from pydantic import BaseModel, Field
from typing import List

class Entity(BaseModel):
    """An entity extracted from the text."""
    name: str = Field(description="Name of the entity.")
    description: str = Field(description="Description of the entity.")
    entity_type: str = Field(description="Type of the entity (e.g., Methodology, Claim, etc.)")

class Relationship(BaseModel):
    """A relationship between two entities."""
    source_entity: str = Field(description="Name of the source entity.")
    target_entity: str = Field(description="Name of the target entity.")
    relationship_type: str = Field(description="Type of the relationship (e.g., USES, SUPPORTS, etc.)")

class KnowledgeGraph(BaseModel):
    """A knowledge graph extracted from a text."""
    entities: List[Entity] = Field(description="List of entities in the knowledge graph.")
    relationships: List[Relationship] = Field(description="List of relationships in the knowledge graph.")
