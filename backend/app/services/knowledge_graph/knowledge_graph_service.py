import uuid
import asyncio
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.file_upload.file_upload_service import FileUploadService
from app.services.knowledge_graph.kg_helper_service import KGHelperService 
from app.config.storage_config import bucket
from app.models.knowledge_graph.graph_extraction import KnowledgeGraph, Entity, Relationship 
from app.models.knowledge_graph.paper_segement import *
from app.models.knowledge_graph.ps_kg_entity import PSKgEntityCreate, PSKgEntityDB
from app.models.knowledge_graph.ps_kg_relationship import PSKgRelationshipCreate, PSKgRelationshipDB
from pypdf import PdfReader
import io
import tempfile
import os
from typing import Optional # Ensure Optional is imported

# --- UPDATED IMPORTS FOR DOCLING ---
from docling.document_converter import DocumentConverter 
from docling_core.types.doc.document import DoclingDocument # CORRECTED IMPORT
# -----------------------------------


class KGService:
    def __init__(self):
        self.file_upload_service = FileUploadService()
        self.helper_service = KGHelperService()

    async def construct_kg_from_files(self, file_guids: list[uuid.UUID], db: AsyncSession):
        for file_guid in file_guids:
            file_item = await self.file_upload_service.get_file_by_guid(db, file_guid)
            if file_item:
                blob = bucket.blob(file_item.file_name)
                loop = asyncio.get_running_loop()
                file_content_bytes = await loop.run_in_executor(None, blob.download_as_bytes)
                
                # Pass bytes to the main processing function
                await self.process_file_content(
                    file_content_bytes, 
                    file_item.mime_type, 
                    file_guid, 
                    db
                )

    async def process_file_content(self, file_content_bytes: bytes, mime_type: str, file_guid: uuid.UUID, db: AsyncSession):
        """
        Orchestrates the 4-round KG construction strategy from Postulate.md.
        Uses docling for PDF processing with a pypdf fallback.
        """
        print(f"Starting KG construction for file: {file_guid}")

        doc: Optional[DoclingDocument] = None
        full_text_content = ""
        temp_file_path = ""

        if mime_type == 'application/pdf':
            # docling requires a file path, so we must use a temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_f:
                temp_f.write(file_content_bytes)
                temp_file_path = temp_f.name
            
            try:
                # Use docling to convert PDF to a structured object
                print(f"Processing PDF with docling: {temp_file_path}")
                converter = DocumentConverter()
                
                result = converter.convert(temp_file_path)
                doc = result.document

                # Use the markdown export from the docling document
                full_text_content = doc.export_to_markdown() 
                print(f"✅ Successfully processed PDF with docling. Markdown length: {len(full_text_content)}")
            except Exception as e:
                print(f"⚠️ Docling processing failed: {e}.")
                
            finally:
                # Clean up the temp file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
        else:
            full_text_content = file_content_bytes.decode('utf-8')

        if not full_text_content:
            print(f"File {file_guid} has no text content. Aborting.")
            return

        # === ROUND 1: ResearchPaper Entity ===
        print("--- Round 1: Processing Paper Entity ---")
        paper_entity = await self._process_round_1(full_text_content, file_guid, db)
        if not paper_entity:
            print(f"Failed to create main paper entity for file {file_guid}. Aborting.")
            return
        print(f"✅ Created ResearchPaper entity: {paper_entity.name}")

        # === ROUND 2: Section Entities & Relationships ===
        print("--- Round 2: Processing Sections ---")
        section_chunk_list: Optional[SectionChunkList] = None
        if doc:
            print("Using docling document structure to extract sections...")
            section_chunk_list = self.helper_service._get_sections_from_docling(doc)
        
        if not section_chunk_list:
            print("Docling sections not available or failed.")

        if not section_chunk_list:
            print("Failed to split paper into sections. Aborting Round 2.")
            return
        print(f"✅ Separated ResearchPaper into {len(section_chunk_list.sections)} sections.")
        for s in section_chunk_list.sections:
            print(s)
            print("\n")
        

        section_entities = {} # {section_title: (PSKgEntityDB, section_text)}
        for section_data in section_chunk_list.sections:
            section_entity = await self._process_round_2(section_data, paper_entity.guid, file_guid, db)
            if section_entity:
                section_entities[section_data.section_title] = (section_entity, section_data.section_text)
        print(f"✅ Completed ResearchPaper section entity generation")

        # === ROUND 3: Fine-grained Entities & Relationships ===
        print("--- Round 3: Processing Paragraphs ---")
        for section_title, (section_entity, section_text) in section_entities.items():
            if not section_text: # Skip sections that had no text
                continue
                
            print(f"Processing paragraphs for section: {section_title}")
            # This helper now returns a SectionChunkList where each "section" is a paragraph
            paragraph_chunks = await self.helper_service._get_text_chunks(section_text, "paragraphs")
            
            if not paragraph_chunks:
                continue

            # Iterate over paragraph_chunks.sections and pass the .section_text
            for para_chunk in paragraph_chunks.sections:
                await self._process_round_3(para_chunk.section_text, section_entity.guid, file_guid, db)

        # === ROUND 4: Handling References ===
        print("--- Round 4: Reference handling is integrated into Round 3. ---")

        print(f"KG construction finished for file: {file_guid}")
        await db.commit()


    async def _process_round_1(self, text_content: str, file_guid: uuid.UUID, db: AsyncSession) -> Optional[PSKgEntityDB]:
        """Executes Round 1: Create ResearchPaper Entity"""
        prompt = f"""
        Extract the metadata from the following research paper.

        Text:
        {text_content[:8000]} 
        """
        try:
            details = await self.helper_service._generate_structured_content(prompt, PaperDetails)
            if not details:
                return None
            
            content = (
                f"Title: {details.title}\n"
                f"Authors: {', '.join(details.authors)}\n"
                f"Venue: {details.publication_venue}\n"
                f"Year: {details.year}"
            )
            
            entity = await self.helper_service._create_entity(
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
        
        # Check if section_text is empty or too short
        if not section_data.section_text or len(section_data.section_text) < 50:
            print(f"Skipping empty or short section: {section_data.section_title}")
            return None

        prompt = f"""
        Summarize the following section of a research paper titled '{section_data.section_title}'.
        
        Text:
        {section_data.section_text[:8000]}
        """
        try:
            summary = await self.helper_service._generate_structured_content(prompt, SectionSummary)
            if not summary:
                return None

            entity = await self.helper_service._create_entity(
                db=db,
                entity_type="Section",
                file_guid=file_guid,
                content=summary.summary,
                name=section_data.section_title
            )
            await self.helper_service._create_relationship(
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
            para_entity = await self.helper_service._create_entity(
                db=db,
                entity_type="Paragraph",
                file_guid=file_guid,
                content=para_text,
                name=f"Paragraph {str(uuid.uuid4())[:8]}"
            )

            # 2. Create (Section)-[CONTAINS_PARAGRAPH]->(Paragraph) relationship
            await self.helper_service._create_relationship(
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

            Provide a short name to the entity. 


            """
            analysis = await self.helper_service._generate_structured_content(prompt, ParagraphAnalysis)
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
                        await self.helper_service._create_relationship(
                            db=db,
                            source_guid=para_entity.guid,
                            target_guid=citation_entity.guid,
                            relationship_type="CITES"
                        )
                else:
                    # Create the classified entity (e.g., Claim, Methodology)
                    classified_entity = await self.helper_service._create_entity(
                        db=db,
                        entity_type=classified.entity_type,
                        file_guid=file_guid,
                        content=para_text,
                        name=classified.name
                    )
                    # Create (Paragraph)-[REL]->(Classified_Entity)
                    await self.helper_service._create_relationship(
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
            citation_entity = await self.helper_service._create_entity(
                db=db,
                entity_type="Citation",
                file_guid=file_guid,
                content=citation_text,
                name=f"Citation: {citation_text[:50]}..."
            )

            # 2. Parse the citation text to get details for the referenced paper
            prompt = f"""
            Parse the following citation text and extract the reference paper details. 
            Extract the title of the reference paper.
            Extract the authors of the reference paper. 
            Extract the publication venue of the reference paper if available.
            Extract the year of publication of the reference paper.

            Citation: "{citation_text}"
            """
            details = await self.helper_service._generate_structured_content(prompt, ReferenceDetails)
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
            referenced_paper = await self.helper_service._create_entity(
                db=db,
                entity_type="ResearchPaper",
                file_guid=None, # This paper is *referenced*, it doesn't have a file_guid in our system
                content=content,
                name=details.title
            )

            # 4. Create (Citation)-[REFERENCES]->(ResearchPaper) relationship
            await self.helper_service._create_relationship(
                db=db,
                source_guid=citation_entity.guid,
                target_guid=referenced_paper.guid,
                relationship_type="REFERENCES"
            )
            
            return citation_entity
        
        except Exception as e:
            print(f"Error in Round 4 (Citation processing): {e}")
            return None