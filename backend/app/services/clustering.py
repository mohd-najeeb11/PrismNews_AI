import uuid
from typing import Any, Dict, List
import numpy as np

from app.core.logging import logger
from app.models.article import NormalizedArticle
from app.services.embeddings import embed_text


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    a = np.array(vec_a)
    b = np.array(vec_b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


class ClusteringService:
    """
    Groups ingested articles into Story clusters based on cosine similarity of local embeddings.
    """

    def cluster_articles(
        self, articles: List[NormalizedArticle], threshold: float = 0.70
    ) -> List[Dict[str, Any]]:
        """
        Clusters articles with similarity >= threshold into cohesive story clusters.
        """
        if not articles:
            return []

        logger.info(f"Clustering {len(articles)} articles with similarity threshold {threshold}...")

        # Ensure all articles have embeddings
        for art in articles:
            if art.embedding is None:
                text = f"{art.title}. {art.content[:600]}"
                art.embedding = embed_text(text)

        clusters: List[List[NormalizedArticle]] = []
        visited = set()

        for i, art_a in enumerate(articles):
            if i in visited:
                continue

            cluster = [art_a]
            visited.add(i)

            for j, art_b in enumerate(articles):
                if j in visited:
                    continue

                sim = cosine_similarity(art_a.embedding, art_b.embedding)
                if sim >= threshold:
                    cluster.append(art_b)
                    visited.add(j)

            clusters.append(cluster)

        # Form story objects from clusters
        stories: List[Dict[str, Any]] = []
        for cluster in clusters:
            primary_article = cluster[0]
            sources = list({art.source_name for art in cluster})

            story = {
                "id": str(uuid.uuid4()),
                "headline": primary_article.title,
                "topic": "General News",  # Default category or extracted topic
                "created_at": primary_article.published_at,
                "article_count": len(cluster),
                "sources": sources,
                "articles": [
                    {
                        "id": str(uuid.uuid4()),
                        "source": art.source_name,
                        "title": art.title,
                        "url": art.url,
                        "published_at": art.published_at,
                        "snippet": art.content[:300],
                    }
                    for art in cluster
                ],
            }
            stories.append(story)

        logger.info(f"Clustering completed. Generated {len(stories)} story clusters.")
        return stories


clustering_service = ClusteringService()
