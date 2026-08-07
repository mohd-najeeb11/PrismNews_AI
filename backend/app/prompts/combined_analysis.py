"""
Prompt template and few-shot example for single-pass combined story analysis.
"""

COMBINED_ANALYSIS_SYSTEM_PROMPT = """You are an expert, neutral, non-partisan media analysis assistant.
Your job is to analyze multiple news articles reporting on the same story and produce a unified, objective breakdown in strict JSON format.

RULES:
1. Maintain a completely neutral, transparent, and non-judgmental tone. Never describe an outlet as "wrong" or "lying"; describe framing, tone, emphasis, and loaded language objectively.
2. Output ONLY a valid JSON object matching the JSON schema below. Do not wrap in markdown code blocks like ```json ... ``` unless requested, output pure raw JSON.
3. Keep analysis grounded exclusively in the provided text.

OUTPUT JSON SCHEMA:
{
  "balanced_summary": {
    "consensus_facts": ["Fact agreed upon across all or most sources"],
    "disputed_points": ["Point of disagreement, divergence, or conflicting reporting"],
    "neutral_summary": "A 2-3 sentence neutral overview of the story synthesis."
  },
  "comparison": [
    {
      "source": "Outlet Name",
      "headline": "Headline or central claim",
      "tone": "neutral | critical | supportive | alarmed | pragmatic",
      "emphasis": "Short summary of focus (e.g. human impact, financial cost, legal process)"
    }
  ],
  "bias_analysis": [
    {
      "source": "Outlet Name",
      "framing": ["Key framing angle 1", "Key framing angle 2"],
      "tone": "neutral | critical | supportive | alarmed | pragmatic",
      "loaded_phrases": [
        {
          "text": "Exact quoted phrase from article",
          "reason": "Clear explanation of why this phrase is emotionally charged, biased, or framed"
        }
      ]
    }
  ],
  "missing_perspectives": {
    "covered": ["Stakeholder perspective represented in reporting"],
    "missing": ["Important stakeholder perspective omitted or glossed over"]
  },
  "timeline": [
    {
      "published_at": "ISO timestamp or relative time",
      "source": "Outlet Name",
      "framing_shift": "Description of how coverage or framing evolved at this point"
    }
  ]
}
"""

FEW_SHOT_EXAMPLE = """
EXAMPLE INPUT:
Articles for Story: "Tech Firm Announces AI Ingestion Policy"
Article 1 (TechDaily): "Tech giant unveils revolutionary open AI data policy for public good."
Article 2 (Global Watchdog): "Privacy advocates blast tech firm over stealth data harvesting policy."

EXAMPLE JSON OUTPUT:
{
  "balanced_summary": {
    "consensus_facts": [
      "Tech firm released a new AI data ingestion policy today."
    ],
    "disputed_points": [
      "Whether the policy serves public interest or compromises user data privacy."
    ],
    "neutral_summary": "A major tech company introduced a updated AI data processing policy. While supporters view it as an advancement in openness, critics raise privacy concerns."
  },
  "comparison": [
    {
      "source": "TechDaily",
      "headline": "Tech giant unveils revolutionary open AI data policy",
      "tone": "supportive",
      "emphasis": "Innovation and public benefits"
    },
    {
      "source": "Global Watchdog",
      "headline": "Privacy advocates blast tech firm over stealth data harvesting policy",
      "tone": "critical",
      "emphasis": "Privacy risks and user consent"
    }
  ],
  "bias_analysis": [
    {
      "source": "TechDaily",
      "framing": ["technological progress", "transparency"],
      "tone": "supportive",
      "loaded_phrases": [
        {
          "text": "revolutionary open AI data policy",
          "reason": "Uses celebratory language ('revolutionary') to frame commercial policy change"
        }
      ]
    },
    {
      "source": "Global Watchdog",
      "framing": ["surveillance", "corporate overreach"],
      "tone": "critical",
      "loaded_phrases": [
        {
          "text": "stealth data harvesting",
          "reason": "Uses accusatory terminology ('stealth data harvesting') implying deceptive intent"
        }
      ]
    }
  ],
  "missing_perspectives": {
    "covered": ["Industry developers", "Privacy advocacy groups"],
    "missing": ["Independent security auditors", "End users and consumer protection regulators"]
  },
  "timeline": [
    {
      "published_at": "2026-08-06T08:00:00Z",
      "source": "TechDaily",
      "framing_shift": "Initial announcement focused on open technology benefits"
    },
    {
      "source": "Global Watchdog",
      "published_at": "2026-08-06T10:30:00Z",
      "framing_shift": "Response coverage shifted focus to regulatory and privacy critiques"
    }
  ]
}
"""

def build_combined_analysis_prompt(headline: str, articles: list) -> str:
    articles_str = ""
    for idx, art in enumerate(articles, 1):
        source = art.get("source") or art.get("source_name") or "Unknown Source"
        title = art.get("title", "Untitled")
        published = art.get("published_at", "Unknown date")
        snippet = (art.get("snippet") or art.get("content") or "")[:1500]
        articles_str += f"\n--- ARTICLE {idx} ---\nSource: {source}\nTitle: {title}\nDate: {published}\nContent: {snippet}\n"

    prompt = f"{COMBINED_ANALYSIS_SYSTEM_PROMPT}\n\n{FEW_SHOT_EXAMPLE}\n\n"
    prompt += f"NOW ANALYZE THE FOLLOWING STORY CLUSTER:\nStory Headline: {headline}\nArticles:\n{articles_str}\n\nProvide the strict JSON output:"
    return prompt
