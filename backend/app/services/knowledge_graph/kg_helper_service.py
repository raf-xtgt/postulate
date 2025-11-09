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
from pypdf import PdfReader
import io
from typing import List, Literal, Optional
from docling_core.types.doc.document import DoclingDocument # CORRECTED IMPORT
from vertexai.language_models import TextEmbeddingModel
from vertexai.generative_models import GenerativeModel, GenerationConfig
from pydantic import BaseModel

EMBEDDING_MODEL_NAME = "text-embedding-004" 
embedding_model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL_NAME)

class KGHelperService:
    def __init__(self):
        self.generative_model = GenerativeModel(
            "gemini-2.0-flash" 
        )

    def _get_sections_from_docling(self, doc: DoclingDocument) -> Optional[SectionChunkList]:
        """
        Extracts section chunks from a DoclingDocument object by iterating its
        structured elements. This replaces the LLM call for section splitting.
        """
        try:
            sections = []
            current_title = "Unknown Section" # Default
            current_texts = []

            # Try to find a first heading to use as the first section title
            for element in doc.texts:
                if type(element).__name__ == "SectionHeaderItem":
                    current_title = element.text
                    break
            
            # If no heading found, guess 'Abstract'
            if current_title == "Unknown Section" and doc.metadata.get('title'):
                    current_title = "Abstract" 

            for element in doc.texts:
                if type(element).__name__ in ["SectionHeaderItem", "TitleItem"]: # Added "Title" as a good practice
                    # Save the previous section if it has content
                    if current_texts:
                        sections.append(SectionChunk(
                            section_title=current_title,
                            section_text="\n\n".join(current_texts)
                        ))
                    # Start a new one
                    current_title = element.text
                    current_texts = []
                else:
                    # Get the text of the element
                    current_texts.append(element.text)
            
            # Add the last section
            if current_texts:
                    sections.append(SectionChunk(
                    section_title=current_title,
                    section_text="\n\n".join(current_texts)
                ))

            if not sections:
                return None
                
            return SectionChunkList(sections=sections)
        except Exception as e:
            print(f"Error processing docling document for sections: {e}")
            return None


    async def _generate_structured_content(self, prompt: str, response_model: BaseModel):
        """Calls the LLM with a prompt and a JSON schema, returns a Pydantic object."""
        try:
            
            response = await self.generative_model.generate_content_async(
                prompt,
                generation_config=GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=response_model.model_json_schema() # Use .model_json_schema() for Vertex
                )
            )
            # print("structured content response", response) # Optional: for debugging
            response_text = response.text.strip().replace("```json", "").replace("```", "")
            print("response text")
            print(response_text)
            return response_model.model_validate_json(response_text)
        except Exception as e:
            print(f"Error generating structured content: {e}")
            # print(f"Prompt: {prompt[:200]}...") # Optional: for debugging
            return None


    async def _get_text_chunks(self, text: str, chunk_type: Literal["sections", "paragraphs"]) -> Optional[SectionChunkList]:
        """
        Splits text into sections (via LLM fallback) or paragraphs (via heuristic).
        Returns a SectionChunkList for a consistent interface.
        """
        if chunk_type == "sections":
            # This is now the FALLBACK logic if docling fails
            prompt = f"""
            Split the following research paper text into its main sections (e.g., Abstract, Introduction, Methodology, Results, Conclusion, References).
            Ensure the 'section_text' field contains the full text of that section.

            Text:
            {text}
            """
            return await self._generate_structured_content(prompt, SectionChunkList)
        
        elif chunk_type == "paragraphs":
            # **BUG FIX**: This now returns a SectionChunkList for consistency,
            # which fixes the loop in _process_round_3.
            if not text:
                return None
            para_chunks = [para.strip() for para in text.split('\n\n') if len(para.strip()) > 50]
            if not para_chunks:
                return None
                
            section_chunk_list = [
                SectionChunk(section_title=f"Paragraph {i+1}", section_text=para) 
                for i, para in enumerate(para_chunks)
            ]
            return SectionChunkList(sections=section_chunk_list)
    
    async def _create_entity(self, db: AsyncSession, entity_type: str, content: str, name: str, file_guid: Optional[uuid.UUID]) -> PSKgEntityDB:
        """Creates an embedding and saves a new entity to the DB."""
        try:
            # 💡 FIX: Removed the 'task_type' argument
            embedding_response = await embedding_model.get_embeddings_async(
                [content]
            )
            
            # Vertex AI returns a list of embedding objects (one for each item in the input list)
            # We need the vector from the first (and only) item.
            embedding = embedding_response[0].values
            
            # ... (rest of the code is unchanged) ...
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
        
        except Exception as e:
            print(f"Error generating embedding with Vertex AI: {e}")
            # Handle error or raise it
            return None

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