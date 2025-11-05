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



class KGHelperService:
    def __init__(self):
        self.generative_model = genai.GenerativeModel(
            'gemini-2.0-flash'
        )
    async def _generate_structured_content(self, prompt: str, response_model: BaseModel):
        """Calls the LLM with a prompt and a JSON schema, returns a Pydantic object."""
        try:
            
            response = await self.generative_model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=response_model
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

            Text:
            {text[:10000]}
            """
            return await self._generate_structured_content(prompt, SectionChunkList)
        
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

