from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class NormalizedArticle(BaseModel):
    id: Optional[str] = None
    source_id: str
    source_name: str
    title: str
    url: str
    content: str
    published_at: str
    embedding: Optional[List[float]] = None


class IngestBatchResult(BaseModel):
    total_fetched: int
    new_inserted: int
    duplicates_skipped: int
    sources_processed: int
