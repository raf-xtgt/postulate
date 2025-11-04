import uuid
import asyncio
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.file_upload.file_upload_service import FileUploadService
from app.config.storage_config import bucket
from app.models.knowledge_graph.graph_extraction import KnowledgeGraph, Entity, Relationship 
from app.models.knowledge_graph.paper_segement import *
from app.models.knowledge_graph.ps_kg_entity import PSKgEntityCreate, PSKgEntityDB
from app.models.knowledge_graph.ps_kg_relationship import PSKgRelationshipCreate, PSKgRelationshipDB
import google.generativeai as genai
from pypdf import PdfReader
import io



class KGService:
    def __init__(self):
        self.file_upload_service = FileUploadService()
        # Use a model that supports JSON mode
        self.generative_model = genai.GenerativeModel(
            'gemini-2.0-flash'
        )

    async def construct_kg_from_files(self, file_guids: list[uuid.UUID], db: AsyncSession):
        for file_guid in file_guids:
            file_item = await self.file_upload_service.get_file_by_guid(db, file_guid)
            if file_item:
                blob = bucket.blob(file_item.file_name)
                loop = asyncio.get_running_loop()
                file_content_bytes = await loop.run_in_executor(None, blob.download_as_bytes)

                text_content = ""
                if file_item.mime_type == 'application/pdf':
                    with io.BytesIO(file_content_bytes) as f:
                        reader = PdfReader(f)
                        for page in reader.pages:
                            text_content += page.extract_text() + "\n\n"
                else:
                    text_content = file_content_bytes.decode('utf-8')
                
                await self.process_file_content(text_content, file_guid, db)

    async def process_file_content(self, text_content:str, file_guid: uuid.UUID, db: AsyncSession):
        """
        Orchestrates the 4-round KG construction strategy from Postulate.md.
        """
        print(f"Starting KG construction for file: {file_guid}")

        # === ROUND 1: ResearchPaper Entity ===
        print("--- Round 1: Processing Paper Entity ---")
        paper_entity = await self._process_round_1(text_content, file_guid, db)
        if not paper_entity:
            print(f"Failed to create main paper entity for file {file_guid}. Aborting.")
            return
        
        print(f"✅ Created ResearchPaper entity: {paper_entity.name}")


        # # === ROUND 2: Section Entities & Relationships ===
        # print("--- Round 2: Processing Sections ---")
        # section_chunks = await self._get_text_chunks(text_content, "sections")
        # if not section_chunks:
        #     print("Failed to split paper into sections. Aborting Round 2.")
        #     return
            
        # section_entities = {} # {section_title: PSKgEntityDB}
        # for section_data in section_chunks:
        #     section_entity = await self._process_round_2(section_data, paper_entity.guid, file_guid, db)
        #     if section_entity:
        #         section_entities[section_data.section_title] = (section_entity, section_data.section_text)

        # # === ROUND 3: Fine-grained Entities & Relationships ===
        # print("--- Round 3: Processing Paragraphs ---")
        # for section_title, (section_entity, section_text) in section_entities.items():
        #     print(f"Processing paragraphs for section: {section_title}")
        #     paragraph_chunks = await self._get_text_chunks(section_text, "paragraphs")
        #     if not paragraph_chunks:
        #         continue

        #     for para_text in paragraph_chunks:
        #         await self._process_round_3(para_text, section_entity.guid, file_guid, db)

        # # === ROUND 4: Handling References ===
        # # This is handled inline within Round 3 when a 'Citation' entity is detected.
        # print("--- Round 4: Reference handling is integrated into Round 3. ---")

        # print(f"KG construction finished for file: {file_guid}")
        # await db.commit()

    async def _process_round_1(self, text_content: str, file_guid: uuid.UUID, db: AsyncSession) -> Optional[PSKgEntityDB]:
        """Executes Round 1: Create ResearchPaper Entity"""
        prompt = f"""
        Extract the metadata from the following research paper.

        Text:
        {text_content[:8000]} 
        """
        try:
            details = await self._generate_structured_content(prompt, PaperDetails)
            if not details:
                return None
            
            content = (
                f"Title: {details.title}\n"
                f"Authors: {', '.join(details.authors)}\n"
                f"Venue: {details.publication_venue}\n"
                f"Year: {details.year}"
            )
            
            entity = await self._create_entity(
                db=db,
                entity_type="ResearchPaper",
                file_guid=file_guid,
                content=content,
                name=details.title
            )
            return entity
        except Exception as e:
            print(f"Error in Round 1: {e}")
            return None

    async def _process_round_2(self, section_data: SectionChunk, paper_guid: uuid.UUID, file_guid: uuid.UUID, db: AsyncSession) -> Optional[PSKgEntityDB]:
        """Executes Round 2: Create Section Entity and Relationship"""
        prompt = f"""
        Summarize the following section of a research paper titled '{section_data.section_title}'.
        Respond with a JSON object that follows this schema:
        {SectionSummary.schema_json(indent=2)}
        
        Text:
        {section_data.section_text[:8000]}
        """
        try:
            summary = await self._generate_structured_content(prompt, SectionSummary)
            if not summary:
                return None

            entity = await self._create_entity(
                db=db,
                entity_type="Section",
                file_guid=file_guid,
                content=summary.summary,
                name=section_data.section_title
            )
            await self._create_relationship(
                db=db,
                source_guid=paper_guid,
                target_guid=entity.guid,
                relationship_type="HAS_SECTION"
            )
            return entity
        except Exception as e:
            print(f"Error in Round 2 for section '{section_data.section_title}': {e}")
            return None

    async def _process_round_3(self, para_text: str, section_guid: uuid.UUID, file_guid: uuid.UUID, db: AsyncSession):
        """Executes Round 3: Create Paragraph, Classified Entities, and Relationships"""
        try:
            # 1. Create Paragraph Entity
            para_entity = await self._create_entity(
                db=db,
                entity_type="Paragraph",
                file_guid=file_guid,
                content=para_text,
                name=f"Paragraph {str(uuid.uuid4())[:8]}"
            )

            # 2. Create (Section)-[CONTAINS_PARAGRAPH]->(Paragraph) relationship
            await self._create_relationship(
                db=db,
                source_guid=section_guid,
                target_guid=para_entity.guid,
                relationship_type="CONTAINS_PARAGRAPH"
            )

            # 3. Classify, create classified entities and relationships
            prompt = f"""
            Analyze the following paragraph and extract all key entities and their relationships to the paragraph.
            The paragraph text is: "{para_text}"

            Valid Entity Types: {list(ENTITY_TYPES.__args__)}
            Valid Relationship Types: {list(RELATIONSHIP_TYPES.__args__)}

            Respond with a JSON object that follows this schema:
            {ParagraphAnalysis.schema_json(indent=2)}
            """
            analysis = await self._generate_structured_content(prompt, ParagraphAnalysis)
            if not analysis:
                return
            
            for classified in analysis.classified_entities:
                if classified.entity_type == "Citation":
                    # --- Inline Round 4 ---
                    citation_entity = await self._get_or_create_citation_and_paper(
                        citation_text=classified.content,
                        file_guid=file_guid, # The file_guid of the *citing* paper
                        db=db
                    )
                    if citation_entity:
                        await self._create_relationship(
                            db=db,
                            source_guid=para_entity.guid,
                            target_guid=citation_entity.guid,
                            relationship_type="CITES"
                        )
                else:
                    # Create the classified entity (e.g., Claim, Methodology)
                    classified_entity = await self._create_entity(
                        db=db,
                        entity_type=classified.entity_type,
                        file_guid=file_guid,
                        content=classified.content,
                        name=classified.name
                    )
                    # Create (Paragraph)-[REL]->(Classified_Entity)
                    await self._create_relationship(
                        db=db,
                        source_guid=para_entity.guid,
                        target_guid=classified_entity.guid,
                        relationship_type=classified.relationship_type
                    )

        except Exception as e:
            print(f"Error in Round 3 for paragraph: {e}")

    async def _get_or_create_citation_and_paper(self, citation_text: str, file_guid: uuid.UUID, db: AsyncSession) -> Optional[PSKgEntityDB]:
        """
        Executes Round 4: Creates Citation entity, parses it, and creates 
        the referenced ResearchPaper entity (if it doesn't exist).
        """
        try:
            # 1. Create Citation entity
            citation_entity = await self._create_entity(
                db=db,
                entity_type="Citation",
                file_guid=file_guid,
                content=citation_text,
                name=f"Citation: {citation_text[:50]}..."
            )

            # 2. Parse the citation text to get details for the referenced paper
            prompt = f"""
            Parse the following citation text and extract the paper details.
            Citation: "{citation_text}"
            
            Respond with a JSON object that follows this schema:
            {ReferenceDetails.schema_json(indent=2)}
            """
            details = await self._generate_structured_content(prompt, ReferenceDetails)
            if not details:
                return citation_entity # Return the citation entity even if parsing fails

            # 3. Create referenced ResearchPaper entity
            content = (
                f"Title: {details.title}\n"
                f"Authors: {', '.join(details.authors)}\n"
                f"Venue: {details.publication_venue}\n"
                f"Year: {details.year}"
            )
            # Note: This creates a new paper entity for every citation.
            # A more robust system would check if this paper_entity already exists.
            referenced_paper = await self._create_entity(
                db=db,
                entity_type="ResearchPaper",
                file_guid=None, # This paper is *referenced*, it doesn't have a file_guid in our system
                content=content,
                name=details.title
            )

            # 4. Create (Citation)-[REFERENCES]->(ResearchPaper) relationship
            await self._create_relationship(
                db=db,
                source_guid=citation_entity.guid,
                target_guid=referenced_paper.guid,
                relationship_type="REFERENCES"
            )
            
            return citation_entity
        
        except Exception as e:
            print(f"Error in Round 4 (Citation processing): {e}")
            return None

    # ===== Helper Functions =====

    async def _generate_structured_content(self, prompt: str, response_model: BaseModel):
        """Calls the LLM with a prompt and a JSON schema, returns a Pydantic object."""
        try:
            
            response = await self.generative_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=response_model.schema()
                )
            )
            print("structured content response", response)
            response_text = response.text.strip().replace("```json", "").replace("```", "")
            return response_model.model_validate_json(response_text)
        except Exception as e:
            print(f"Error generating structured content: {e}")
            print(f"Prompt: {prompt[:200]}...")
            return None


    async def _get_text_chunks(self, text: str, chunk_type: Literal["sections", "paragraphs"]) -> List:
        """Splits text into sections or paragraphs using the LLM."""
        if chunk_type == "sections":
            prompt = f"""
            Split the following research paper text into its main sections (e.g., Introduction, Methodology, Results, Conclusion, References).
            Respond with a JSON object containing a list of sections, following this schema:
            {SectionChunk.schema_json(indent=2)}

            Text:
            {text[:10000]}
            """
            return await self._generate_structured_content(prompt, List[SectionChunk])
        
        elif chunk_type == "paragraphs":
            # A simple heuristic split is often more reliable and cheaper
            return [para.strip() for para in text.split('\n\n') if len(para.strip()) > 50]
    
    async def _create_entity(self, db: AsyncSession, entity_type: str, content: str, name: str, file_guid: Optional[uuid.UUID]) -> PSKgEntityDB:
        """Creates an embedding and saves a new entity to the DB."""
        embedding_response = await genai.embed_content_async(
            model='models/embedding-001',
            content=content,
            task_type="RETRIEVAL_DOCUMENT"
        )
        embedding = embedding_response['embedding']

        new_entity = PSKgEntityCreate(
            entity_type=entity_type,
            file_guid=file_guid,
            content=content,
            content_vec=embedding,
            name=name
        )
        db_entity = PSKgEntityDB(**new_entity.dict())
        db.add(db_entity)
        await db.flush() # Flush to get the new guid
        return db_entity

    async def _create_relationship(self, db: AsyncSession, source_guid: uuid.UUID, target_guid: uuid.UUID, relationship_type: str):
        """Saves a new relationship to the DB."""
        new_rel = PSKgRelationshipCreate(
            source_entity_guid=source_guid,
            target_entity_guid=target_guid,
            relationship_type=relationship_type
        )
        db_rel = PSKgRelationshipDB(**new_rel.dict())
        db.add(db_rel)
        # We will commit at the end of process_file_content

