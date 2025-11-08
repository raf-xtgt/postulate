import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.knowledge_graph.ps_kg_entity import PSKgEntityDB
from app.models.knowledge_graph.ps_kg_relationship import PSKgRelationshipDB
from vertexai.language_models import TextEmbeddingModel

# It's good practice to initialize the model once
EMBEDDING_MODEL_NAME = "text-embedding-004"
embedding_model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL_NAME)

class KGSearchService:
    async def search_and_explain(self, query: str, db: AsyncSession) -> list[str]:
        """
        Performs semantic search on paragraphs and explains the connections of the found nodes.
        
        1. Given a text, perform semantic search on ps_kg_entity to find the top 10 closest matching ps_kg_entity where entity_type=='Paragraph'.
        2. Next find all the nodes connected to these paragraph entities using the ps_kg_relationship table.
        3. Then create a series of sentences that connects the ps_kg_entity using the ps_kg_relationship.
        """
        # Step 1: Get embedding for the user query and find closest paragraphs
        try:
            embedding_response = await embedding_model.get_embeddings_async([query])
            query_embedding = embedding_response[0].values
        except Exception as e:
            print(f"Error getting text embedding: {e}")
            return ["Failed to generate embedding for the query."]

        stmt = (
            select(PSKgEntityDB)
            .filter(PSKgEntityDB.entity_type == 'Paragraph')
            .order_by(PSKgEntityDB.content_vec.l2_distance(query_embedding))
            .limit(10)
        )
        result = await db.execute(stmt)
        paragraph_entities = result.scalars().all()

        if not paragraph_entities:
            return ["No matching paragraphs found in the knowledge graph."]

        # Step 2: Find all connected nodes
        paragraph_guids = {p.guid for p in paragraph_entities}
        
        # Find all relationships involving these paragraphs
        relationships_stmt = (
            select(PSKgRelationshipDB)
            .filter(
                or_(
                    PSKgRelationshipDB.source_entity_guid.in_(paragraph_guids),
                    PSKgRelationshipDB.target_entity_guid.in_(paragraph_guids)
                )
            )
        )
        relationships_result = await db.execute(relationships_stmt)
        relationships = relationships_result.scalars().all()

        if not relationships:
            return ["Found matching paragraphs, but they have no relationships in the graph."]

        # Collect all unique entity GUIDs from the relationships to fetch them in one go
        all_involved_guids = set(paragraph_guids)
        for rel in relationships:
            all_involved_guids.add(rel.source_entity_guid)
            all_involved_guids.add(rel.target_entity_guid)
            
        # Fetch all involved entities (paragraphs and their connections)
        entities_stmt = select(PSKgEntityDB).filter(PSKgEntityDB.guid.in_(all_involved_guids))
        entities_result = await db.execute(entities_stmt)
        entities_map = {e.guid: e for e in entities_result.scalars().all()}

        # Step 3: Create explanation sentences
        explanations = set()
        for rel in relationships:
            source_entity = entities_map.get(rel.source_entity_guid)
            target_entity = entities_map.get(rel.target_entity_guid)

            if source_entity and target_entity:
                # Make the sentence more readable
                source_desc = f"The {source_entity.entity_type.lower()} '{source_entity.name}'"
                target_desc = f"the {target_entity.entity_type.lower()} '{target_entity.name}'"
                
                # Reformat relationship type for readability (e.g., 'HAS_SECTION' -> 'has section')
                rel_desc = rel.relationship_type.replace('_', ' ').lower()

                explanation = f"{source_desc} {rel_desc} {target_desc}."
                explanations.add(explanation.capitalize())

        return list(explanations)
