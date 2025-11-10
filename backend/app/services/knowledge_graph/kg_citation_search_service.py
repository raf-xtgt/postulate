import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from collections import defaultdict

from app.models.knowledge_graph.ps_kg_entity import PSKgEntityDB
from app.models.knowledge_graph.ps_kg_relationship import PSKgRelationshipDB
from app.models.knowledge_graph.citation_search_dto import CitationResult, RelatedEntity
from app.services.knowledge_graph.kg_helper_service import KGHelperService
from vertexai.language_models import TextEmbeddingModel

EMBEDDING_MODEL_NAME = "text-embedding-004"
embedding_model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL_NAME)

class KGCitationSearchService:
    def __init__(self):
        self.helper_service = KGHelperService()

    async def citation_search(self, query: str, db: AsyncSession, k: int = 3) -> list[CitationResult]:
        """
        Executes the 3-step citation search strategy:
        1. Semantic Seed Node Retrieval
        2. Contextual Graph Traversal (Upward & Downward)
        3. Result Synthesis
        """
        # Step 1: Find seed nodes via semantic search
        seed_nodes = await self._find_seed_nodes(query, db, k)
        
        if not seed_nodes:
            return []
        
        # Step 2 & 3: For each seed node, traverse graph and build result
        results = []
        for seed_node in seed_nodes:
            result = await self._build_citation_result(seed_node, db)
            if result:
                results.append(result)
        
        return results

    async def _find_seed_nodes(self, query: str, db: AsyncSession, k: int) -> list[tuple[PSKgEntityDB, float]]:
        """
        Step 1: Semantic Seed Node Retrieval
        Finds the top-k most relevant entities of specific types using vector similarity.
        """
        # Generate query embedding
        embedding_response = await embedding_model.get_embeddings_async([query])
        query_embedding = embedding_response[0].values
        
        # Define target entity types for high-relevance results
        target_types = ["Paragraph", "Claim", "Methodology", "Key Concept", "Result"]
        
        # Perform vector similarity search
        stmt = (
            select(
                PSKgEntityDB,
                PSKgEntityDB.content_vec.cosine_distance(query_embedding).label("distance")
            )
            .where(PSKgEntityDB.entity_type.in_(target_types))
            .order_by("distance")
            .limit(k)
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        # Convert distance to similarity score (1 - distance)
        seed_nodes = [(row[0], 1 - row[1]) for row in rows]
        return seed_nodes

    async def _build_citation_result(self, seed_node_tuple: tuple[PSKgEntityDB, float], db: AsyncSession) -> CitationResult | None:
        """
        Step 2 & 3: Contextual Graph Traversal and Result Synthesis
        Builds a complete CitationResult by traversing upward to find the source paper
        and downward to find related entities.
        """
        seed_node, relevance_score = seed_node_tuple
        
        # Step 2.1: Upward Traversal - Find Context Paragraph
        context_paragraph = await self._find_context_paragraph(seed_node, db)
        if not context_paragraph:
            return None
        
        # Step 2.1: Upward Traversal - Find Source Paper
        paper_entity = await self._find_source_paper(context_paragraph, db)
        if not paper_entity:
            return None
        
        # Parse paper metadata from content
        paper_metadata = self._parse_paper_metadata(paper_entity.content)
        
        # Step 2.2: Downward Traversal - Find Related Entities
        related_entities = await self._find_related_entities(context_paragraph, db)
        
        # Step 2.2 (Additional): Connect Related Entities into Context Summary
        context_summary = await self.helper_service.connect_related_entities(
            paragraph_text=context_paragraph.content,
            related_entities=related_entities
        )
        
        # Step 3: Result Synthesis
        return CitationResult(
            paper_title=paper_metadata.get("title", "Unknown"),
            paper_authors=paper_metadata.get("authors", "Unknown"),
            paper_year=paper_metadata.get("year", "Unknown"),
            paper_venue=paper_metadata.get("venue", "Unknown"),
            paragraph_text=context_paragraph.content,
            relevance_score=relevance_score,
            context_summary=context_summary
        )

    async def _find_context_paragraph(self, seed_node: PSKgEntityDB, db: AsyncSession) -> PSKgEntityDB | None:
        """
        Finds the parent Paragraph entity for a seed node.
        If seed is already a Paragraph, returns it directly.
        Otherwise, traverses relationships to find parent Paragraph.
        """
        if seed_node.entity_type == "Paragraph":
            return seed_node
        
        # Find parent paragraph via reverse relationships
        # The paragraph is the SOURCE of relationships like STATES, USES, PRESENTS, DISCUSSES
        stmt = (
            select(PSKgEntityDB)
            .join(
                PSKgRelationshipDB,
                and_(
                    PSKgRelationshipDB.source_entity_guid == PSKgEntityDB.guid,
                    PSKgRelationshipDB.target_entity_guid == seed_node.guid
                )
            )
            .where(PSKgEntityDB.entity_type == "Paragraph")
        )
        
        result = await db.execute(stmt)
        paragraph = result.scalar_one_or_none()
        return paragraph

    async def _find_source_paper(self, paragraph: PSKgEntityDB, db: AsyncSession) -> PSKgEntityDB | None:
        """
        Traverses upward from Paragraph -> Section -> ResearchPaper
        """
        # Find parent Section via CONTAINS_PARAGRAPH relationship
        stmt = (
            select(PSKgEntityDB)
            .join(
                PSKgRelationshipDB,
                and_(
                    PSKgRelationshipDB.source_entity_guid == PSKgEntityDB.guid,
                    PSKgRelationshipDB.target_entity_guid == paragraph.guid,
                    PSKgRelationshipDB.relationship_type == "CONTAINS_PARAGRAPH"
                )
            )
            .where(PSKgEntityDB.entity_type == "Section")
        )
        
        result = await db.execute(stmt)
        section = result.scalar_one_or_none()
        
        if not section:
            return None
        
        # Find parent ResearchPaper via HAS_SECTION relationship
        stmt = (
            select(PSKgEntityDB)
            .join(
                PSKgRelationshipDB,
                and_(
                    PSKgRelationshipDB.source_entity_guid == PSKgEntityDB.guid,
                    PSKgRelationshipDB.target_entity_guid == section.guid,
                    PSKgRelationshipDB.relationship_type == "HAS_SECTION"
                )
            )
            .where(PSKgEntityDB.entity_type == "ResearchPaper")
        )
        
        result = await db.execute(stmt)
        paper = result.scalar_one_or_none()
        return paper

    async def _find_related_entities(self, paragraph: PSKgEntityDB, db: AsyncSession) -> list[RelatedEntity]:
        """
        Traverses 1-level deep from the paragraph to find all connected child entities.
        Collects Citations, Claims, Results, Methodologies, and Key Concepts.
        """
        # Find all entities connected FROM the paragraph (paragraph is source)
        stmt = (
            select(PSKgEntityDB, PSKgRelationshipDB.relationship_type)
            .join(
                PSKgRelationshipDB,
                and_(
                    PSKgRelationshipDB.source_entity_guid == paragraph.guid,
                    PSKgRelationshipDB.target_entity_guid == PSKgEntityDB.guid
                )
            )
            .where(
                PSKgEntityDB.entity_type.in_([
                    "Citation", "Claim", "Result", "Methodology", "Key Concept"
                ])
            )
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        related_entities = []
        for entity, rel_type in rows:
            related_entities.append(
                RelatedEntity(
                    entity_type=entity.entity_type,
                    content=entity.content,
                    relationship_type=rel_type
                )
            )
        
        return related_entities

    def _parse_paper_metadata(self, content: str) -> dict[str, str]:
        """
        Parses paper metadata from the content string.
        Expected format:
        Title: <title>
        Authors: <authors>
        Venue: <venue>
        Year: <year>
        Summary: <summary>
        """
        metadata = {}
        lines = content.split('\n')
        
        for line in lines:
            if line.startswith("Title:"):
                metadata["title"] = line.replace("Title:", "").strip()
            elif line.startswith("Authors:"):
                metadata["authors"] = line.replace("Authors:", "").strip()
            elif line.startswith("Venue:"):
                metadata["venue"] = line.replace("Venue:", "").strip()
            elif line.startswith("Year:"):
                metadata["year"] = line.replace("Year:", "").strip()
        
        return metadata
