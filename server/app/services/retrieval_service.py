"""
Retrieval service stub.

When implemented this will:
1. Take a question + project_id
2. Search active context_items and alerts for the project
3. Return ranked relevant chunks
4. Feed chunks into the LLM prompt
"""

from uuid import UUID
from sqlalchemy.orm import Session


async def retrieve_context(question: str, project_id: UUID, db: Session) -> list[dict]:
    # TODO: implement semantic or keyword retrieval over context_items
    return []
