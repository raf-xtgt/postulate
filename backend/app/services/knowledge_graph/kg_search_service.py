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

    def _get_entity_display_text(self, entity: PSKgEntityDB) -> str:
        """Gets the most appropriate display text for an entity."""
        if entity.entity_type in ["ResearchPaper", "Section"]:
            return entity.name
        if entity.entity_type == "Paragraph":
            content = entity.content
            return content
        # For other types like Claim, Methodology, use name. Fallback to content.
        return entity.name if entity.name else entity.content


    async def _find_path_to_section(self, start_guid: uuid.UUID, parents_map: dict, entities_map: dict) -> list[list[uuid.UUID]]:
        """Iteratively finds paths from a start node up to a Section."""
        paths = []
        q = [[start_guid]]  # Queue for BFS-like path exploration

        while q:
            current_path_guids = q.pop(0)
            last_node_guid = current_path_guids[-1]
            
            last_node = entities_map.get(last_node_guid)
            if last_node and last_node.entity_type == 'Section':
                paths.append(current_path_guids)
                continue # Found a full path, don't go further up this branch

            if last_node_guid not in parents_map:
                continue

            for parent_guid, rel_type in parents_map[last_node_guid]:
                if parent_guid not in current_path_guids:  # Avoid cycles
                    new_path = current_path_guids + [parent_guid]
                    q.append(new_path)
        return paths


    async def _find_paths_down(self, start_guid: uuid.UUID, children_map: dict, max_depth: int = 2) -> list[list[uuid.UUID]]:
        """Performs a traversal to find all downward paths up to a max_depth."""
        all_paths = []
        q = [([start_guid], 0)]  # Queue of ([path_guids], depth)

        while q:
            current_path_guids, depth = q.pop(0)

            # We want the full path including the start node, so we add it.
            # But we only care about paths that go somewhere.
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
                # This can happen if a relationship is outside our fetched subgraph.
                # Let's be lenient and just skip this segment.
                continue

            rel_desc = rel_type.replace('_', ' ').lower()
            
            source_text = self._get_entity_display_text(source_entity)
            target_text = self._get_entity_display_text(target_entity)

            if i == 0:
                source_desc = f"The {source_entity.entity_type.lower()} '{source_text}'"
                target_desc = f"the {target_entity.entity_type.lower()} '{target_text}'"
                clauses.append(f"{source_desc} {rel_desc} {target_desc}")
            else:
                target_desc = f"the {target_entity.entity_type.lower()} '{target_text}'"
                clauses.append(f"which {rel_desc} {target_desc}")

        if not clauses:
            return None

        sentence = ", ".join(clauses) + "."
        return sentence.capitalize()


    async def search_and_explain(self, query: str, db: AsyncSession) -> list[str]:
        """
        Performs semantic search on papers and paragraphs, then does bi-directional 
        graph traversal to explain relationships.
        """
        # Step 1: Get query embedding
        try:
            embedding_response = await embedding_model.get_embeddings_async([query])
            query_embedding = embedding_response[0].values
        except Exception as e:
            print(f"Error getting text embedding: {e}")
            return ["Failed to generate embedding for the query."]

        # Step 2: Semantic search for top 3 ResearchPaper entities
        paper_stmt = (
            select(PSKgEntityDB)
            .filter(PSKgEntityDB.entity_type == 'ResearchPaper')
            .order_by(PSKgEntityDB.content_vec.l2_distance(query_embedding))
            .limit(3)
        )
        paper_result = await db.execute(paper_stmt)
        research_papers = paper_result.scalars().all()

        if not research_papers:
            return ["No matching research papers found."]

        paper_file_guids = [p.file_guid for p in research_papers if p.file_guid]
        paper_titles_map = {p.file_guid: p.name for p in research_papers if p.file_guid}

        if not paper_file_guids:
            return ["Found research papers, but they have no associated files to search within."]

        # Step 3: Semantic search for top 3 Paragraphs (Source Nodes) within those papers
        paragraph_stmt = (
            select(PSKgEntityDB)
            .filter(
                PSKgEntityDB.entity_type == 'Paragraph',
                PSKgEntityDB.file_guid.in_(paper_file_guids)
            )
            .order_by(PSKgEntityDB.content_vec.l2_distance(query_embedding))
            .limit(3)
        )
        paragraph_result = await db.execute(paragraph_stmt)
        source_nodes = paragraph_result.scalars().all()

        if not source_nodes:
            return ["No matching paragraphs found in the top research papers."]

        # Step 4: Broad Data Fetch to create a local subgraph around source nodes
        # We need to fetch enough context to build the paths.
        # Let's fetch 3 levels of connections around the source nodes.
        found_guids = {p.guid for p in source_nodes}
        all_relationships = []
        
        current_guids = set(found_guids)
        # Fetch 3 levels: 1 for section parent, 2 for children.
        for _ in range(3): 
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
            
            # Update found_guids with all nodes we've seen
            new_nodes = next_guids - found_guids
            found_guids.update(new_nodes)
            current_guids = new_nodes # Only search from the new frontier

        # Also add the paper entities to the map
        found_guids.update([p.guid for p in research_papers])

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

        # Step 5: Pathfinding and Formatting
        all_sentences = set()
        for sn in source_nodes:
            # Find path up to the parent section
            source_paths = await self._find_path_to_section(sn.guid, parents_map, entities_map)
            # Find paths down 2 levels
            context_paths = await self._find_paths_down(sn.guid, children_map, max_depth=2)
            
            paper_title = paper_titles_map.get(sn.file_guid, "Unknown Paper")

            if not source_paths:
                continue

            for sp in source_paths:
                reversed_sp = list(reversed(sp)) # Path from Section -> ... -> SN
                
                if not context_paths:
                    # No children, just format the upward path
                    sentence = self._format_path_to_sentence(reversed_sp, entities_map, relationships_map)
                    if sentence:
                        all_sentences.add(f"In the paper '{paper_title}', {sentence}")
                else:
                    for cp in context_paths:
                        # cp is [SN, child1, child2]
                        # reversed_sp is [Section, ..., SN]
                        # Combine them: [Section, ..., SN, child1, child2]
                        if not cp: continue
                        combined_path = reversed_sp + cp[1:]
                        sentence = self._format_path_to_sentence(combined_path, entities_map, relationships_map)
                        if sentence:
                            all_sentences.add(f"In the paper '{paper_title}', {sentence}")

        if not all_sentences:
            return ["Found matching paragraphs, but could not construct meaningful relationship paths."]

        return sorted(list(all_sentences))
