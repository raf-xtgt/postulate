import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from collections import defaultdict

from app.models.knowledge_graph.ps_kg_entity import PSKgEntityDB
from app.models.knowledge_graph.ps_kg_relationship import PSKgRelationshipDB
from vertexai.language_models import TextEmbeddingModel

EMBEDDING_MODEL_NAME = "text-embedding-004"
embedding_model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL_NAME)

class KGSearchService:

    async def _find_paths_up_to_root(self, start_guid: uuid.UUID, parents_map: dict, entities_map: dict) -> list[list[uuid.UUID]]:
        """Iteratively finds all paths from a start node up to a ResearchPaper root."""
        paths = []
        q = [[start_guid]]  # Queue for BFS-like path exploration

        while q:
            current_path_guids = q.pop(0)
            last_node_guid = current_path_guids[-1]
            
            last_node = entities_map.get(last_node_guid)
            if last_node and last_node.entity_type == 'ResearchPaper':
                paths.append(current_path_guids)
                continue

            if last_node_guid not in parents_map:
                continue

            for parent_guid, rel_type in parents_map[last_node_guid]:
                if parent_guid not in current_path_guids:  # Avoid cycles
                    new_path = current_path_guids + [parent_guid]
                    q.append(new_path)
        return paths

    async def _find_paths_down(self, start_guid: uuid.UUID, children_map: dict, max_depth: int = 3) -> list[list[uuid.UUID]]:
        """Performs a traversal to find all downward paths up to a max_depth."""
        all_paths = []
        q = [([start_guid], 0)]  # Queue of ([path_guids], depth)

        while q:
            current_path_guids, depth = q.pop(0)

            if len(current_path_guids) > 1:
                all_paths.append(current_path_guids)

            if depth >= max_depth:
                continue

            last_node_guid = current_path_guids[-1]
            if last_node_guid not in children_map:
                continue
            
            for child_guid, rel_type in children_map[last_node_guid]:
                if child_guid not in current_path_guids:  # Avoid cycles
                    new_path = current_path_guids + [child_guid]
                    q.append((new_path, depth + 1))
        return all_paths

    def _format_path_to_sentence(self, path_guids: list[uuid.UUID], entities_map: dict, relationships_map: dict) -> str | None:
        """Converts a path of GUIDs into a readable sentence."""
        if len(path_guids) < 2:
            return None

        clauses = []
        for i in range(len(path_guids) - 1):
            source_guid = path_guids[i]
            target_guid = path_guids[i + 1]

            source_entity = entities_map.get(source_guid)
            target_entity = entities_map.get(target_guid)
            rel_type = relationships_map.get((source_guid, target_guid))

            if not all([source_entity, target_entity, rel_type]):
                return None  # Path is broken, discard

            rel_desc = rel_type.replace('_', ' ').lower()

            # Use target_entity.name if it's a Section, else use target_entity.content
            if target_entity.entity_type == "Section":
                target_text = target_entity.name
            else:
                target_text = target_entity.content

            if i == 0:
                source_desc = f"The {source_entity.entity_type.lower()} '{source_entity.name}'"
                target_desc = f"the {target_entity.entity_type.lower()} '{target_text}'"
                clauses.append(f"{source_desc} {rel_desc} {target_desc}")
            else:
                target_desc = f"the {target_entity.entity_type.lower()} '{target_text}'"
                clauses.append(f"which in turn {rel_desc} {target_desc}")

        if not clauses:
            return None

        sentence = ", ".join(clauses) + "."
        return sentence.capitalize()


    async def search_and_explain(self, query: str, db: AsyncSession) -> list[str]:
        """
        Performs semantic search and bi-directional graph traversal.
        """
        # Step 1: Semantic Search
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
            .limit(5)
        )
        result = await db.execute(stmt)
        paragraph_entities = result.scalars().all()

        if not paragraph_entities:
            return ["No matching paragraphs found in the knowledge graph."]

        # Step 2: Broad Data Fetch to create a local subgraph
        found_guids = {p.guid for p in paragraph_entities}
        all_relationships = []
        
        current_guids = set(found_guids)
        for _ in range(4):  # Fetch 4 levels of connections to ensure we get roots and 3-level deep children
            if not current_guids: break
            
            rel_stmt = select(PSKgRelationshipDB).filter(
                or_(
                    PSKgRelationshipDB.source_entity_guid.in_(current_guids),
                    PSKgRelationshipDB.target_entity_guid.in_(current_guids)
                )
            ).distinct()
            rel_result = await db.execute(rel_stmt)
            rels = rel_result.scalars().all()
            
            newly_found_rels = [r for r in rels if r.guid not in {rr.guid for rr in all_relationships}]
            all_relationships.extend(newly_found_rels)
            
            next_guids = set()
            for r in newly_found_rels:
                next_guids.add(r.source_entity_guid)
                next_guids.add(r.target_entity_guid)
            
            current_guids = next_guids - found_guids
            found_guids.update(next_guids)

        entities_stmt = select(PSKgEntityDB).filter(PSKgEntityDB.guid.in_(found_guids))
        entities_result = await db.execute(entities_stmt)
        entities_map = {e.guid: e for e in entities_result.scalars().all()}

        children_map = defaultdict(list)
        parents_map = defaultdict(list)
        relationships_map = {}
        
        for rel in all_relationships:
            children_map[rel.source_entity_guid].append((rel.target_entity_guid, rel.relationship_type))
            parents_map[rel.target_entity_guid].append((rel.source_entity_guid, rel.relationship_type))
            relationships_map[(rel.source_entity_guid, rel.target_entity_guid)] = rel.relationship_type

        # Step 3: Pathfinding and Formatting
        all_sentences = set()
        for para_entity in paragraph_entities:
            upward_paths = await self._find_paths_up_to_root(para_entity.guid, parents_map, entities_map)
            downward_paths = await self._find_paths_down(para_entity.guid, children_map, max_depth=3)

            for path in upward_paths:
                sentence = self._format_path_to_sentence(list(reversed(path)), entities_map, relationships_map)
                if sentence:
                    all_sentences.add(sentence)
            
            for path in downward_paths:
                sentence = self._format_path_to_sentence(path, entities_map, relationships_map)
                if sentence:
                    all_sentences.add(sentence)

        if not all_sentences:
            return ["Found matching paragraphs, but could not construct meaningful relationship paths."]

        return sorted(list(all_sentences))
