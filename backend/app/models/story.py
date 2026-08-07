from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ArticleSummary(BaseModel):
    id: str
    source: str
    title: str
    url: str
    published_at: str
    snippet: Optional[str] = None


class BalancedSummary(BaseModel):
    consensus_facts: List[str]
    disputed_points: List[str]
    neutral_summary: str


class ComparisonItem(BaseModel):
    source: str
    headline: str
    tone: str
    emphasis: str


class LoadedPhrase(BaseModel):
    text: str
    reason: str


class BiasAnalysisItem(BaseModel):
    source: str
    framing: List[str]
    tone: str
    loaded_phrases: List[LoadedPhrase]


class MissingPerspectives(BaseModel):
    covered: List[str]
    missing: List[str]


class TimelineItem(BaseModel):
    published_at: str
    source: str
    framing_shift: str


class StoryAnalysisSchema(BaseModel):
    balanced_summary: Dict[str, Any]
    comparison: List[Dict[str, Any]]
    bias_analysis: Any
    missing_perspectives: Any
    timeline: List[Dict[str, Any]]
    transparency_report: Optional[Dict[str, Any]] = None
    narrative_shifts: Optional[List[Dict[str, Any]]] = None


class StorySummaryResponse(BaseModel):
    id: str
    headline: str
    topic: str
    created_at: str
    article_count: int
    sources: List[str]
    articles: List[ArticleSummary]


class StoryDetailResponse(StorySummaryResponse):
    analysis: Optional[StoryAnalysisSchema] = None
