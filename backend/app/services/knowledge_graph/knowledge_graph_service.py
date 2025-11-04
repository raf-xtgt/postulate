import uuid
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.file_upload.file_upload_service import FileUploadService
from app.config.storage_config import bucket
from app.models.knowledge_graph.graph_extraction import KnowledgeGraph
from app.models.knowledge_graph.ps_kg_entity import PSKgEntityCreate, PSKgEntityDB
from app.models.knowledge_graph.ps_kg_relationship import PSKgRelationshipCreate
import google.generativeai as genai
from pypdf import PdfReader
import io

class KGService:
    def __init__(self):
        self.file_upload_service = FileUploadService()
        self.generative_model = genai.GenerativeModel('gemini-pro')

    async def construct_kg_from_files(self, file_guids: list[uuid.UUID], db: AsyncSession):
        for file_guid in file_guids:
            file_item = await self.file_upload_service.get_file_by_guid(db, file_guid)
            if file_item:
                blob = bucket.blob(file_item.file_path)
                loop = asyncio.get_running_loop()
                file_content_bytes = await loop.run_in_executor(None, blob.download_as_bytes)

                text_content = ""
                if file_item.mime_type == 'application/pdf':
                    with io.BytesIO(file_content_bytes) as f:
                        reader = PdfReader(f)
                        for page in reader.pages:
                            text_content += page.extract_text()
                else:
                    text_content = file_content_bytes.decode('utf-8')

                paragraphs = [p.strip() for p in text_content.split('\n\n') if p.strip()]

                for paragraph in paragraphs:
                    # This is a placeholder for the actual structured output call
                    # as the current google-generativeai library version in requirements
                    # might not support it directly in the way I want.
                    # I will simulate the extraction for now.
                    # In a real scenario, I would use a newer version or a different approach
                    # to get structured JSON output.
                    
                    # Placeholder extraction
                    extracted_kg = await self._extract_kg_from_text(paragraph)
                    if extracted_kg:
                        await self._save_kg(extracted_kg, file_guid, db)

    async def _extract_kg_from_text(self, text: str) -> KnowledgeGraph | None:
        # This is a placeholder for a real implementation that would use a
        # generative model with structured output to extract a KnowledgeGraph.
        # For now, it returns a dummy graph.
        prompt = f"""Extract entities and relationships from the following text. 
        Respond with a JSON object that follows this Pydantic schema: 
        {KnowledgeGraph.schema_json(indent=2)}
        Text: {text}
        """
        try:
            response = await self.generative_model.generate_content_async(prompt)
            # The response.text needs to be parsed into a KnowledgeGraph object.
            # This is a simplification.
            # A robust solution would handle json parsing errors.
            kg = KnowledgeGraph.parse_raw(response.text)
            return kg
        except Exception as e:
            print(f"Error extracting KG: {e}")
            return None

    async def _save_kg(self, kg: KnowledgeGraph, file_guid: uuid.UUID, db: AsyncSession):
        entity_map = {}
        for entity in kg.entities:
            embedding_response = await genai.embed_content_async(model='models/embedding-001', content=entity.description)
            embedding = embedding_response['embedding']

            new_entity = PSKgEntityCreate(
                entity_type=entity.entity_type,
                file_guid=file_guid,
                content=entity.description,
                content_vec=embedding,
                name=entity.name
            )
            db_entity = PSKgEntityDB(**new_entity.dict())
            db.add(db_entity)
            await db.flush()
            entity_map[entity.name] = db_entity.guid

        for rel in kg.relationships:
            source_guid = entity_map.get(rel.source_entity)
            target_guid = entity_map.get(rel.target_entity)
            if source_guid and target_guid:
                new_rel = PSKgRelationshipCreate(
                    source_entity_guid=source_guid,
                    target_entity_guid=target_guid,
                    relationship_type=rel.relationship_type
                )
                db_rel = PSKgRelationshipDB(**new_rel.dict())
                db.add(db_rel)
        
        await db.commit()