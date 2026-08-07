"""
Prompt template and few-shot example for single-pass combined story analysis.
"""

COMBINED_ANALYSIS_SYSTEM_PROMPT = """You are an expert, neutral, non-partisan media analysis assistant and NLP research specialist.
Your task is to analyze multiple news articles reporting on the same story and produce an in-depth, highly informative, contextual breakdown in strict JSON format.

RULES FOR HIGH CONTEXTUAL DEPTH:
1. BALANCED SUMMARY:
   - "neutral_summary": Provide a rich, 3-4 sentence objective synthesis outlining the core story, its legislative/economic context, and broader societal significance.
   - "consensus_facts": Provide 3-4 detailed, specific factual statements verified across all reporting sources.
   - "disputed_points": Provide 2-3 detailed explanations of WHERE and WHY outlets disagree (e.g. regulatory burden vs. public safety, financial cost vs. consumer benefit).
   - "key_takeaway": Provide a clear 2-sentence executive summary explaining the overarching narrative divergence.

2. COMPARISON MATRIX:
   - "framing_summary": For EVERY outlet, write a thorough 2-3 sentence analysis explaining its specific editorial angle, rhetoric stance, and thematic emphasis.
   - Include authentic key quotes with contextual explanation.

3. EXPLAINABLE BIAS:
   - "loaded_phrases": Identify 2-4 emotionally charged or value-laden phrases used by specific outlets.
   - "reason": Provide a detailed 2-sentence NLP rationale explaining WHY the phrase carries rhetorical charge or bias and what emotional response it targets.
   - "neutral_alternative": Provide a complete, fully-formed, objective neutral alternative statement.

4. MISSING PERSPECTIVES:
   - Identify 2-3 omitted stakeholder viewpoints (e.g. independent open-source developers, consumer utility rates, developing nation capacity).
   - "description": Write a thorough 2-sentence explanation of how this perspective is glossed over in mainstream headlines.
   - "why_it_matters": Provide a detailed 2-sentence explanation of the societal, economic, or legal ramifications of this blindspot.
   - "missing_from_outlets": List the exact outlet names omitting this angle.

5. NARRATIVE TIMELINE:
   - Trace chronological framing shifts from initial breaking news to analytical commentary.
   - "framing_shift": Provide a detailed explanation of how headline emphasis evolved over time.

OUTPUT JSON SCHEMA:
{
  "balanced_summary": {
    "consensus_facts": ["Detailed fact 1", "Detailed fact 2", "Detailed fact 3"],
    "disputed_points": ["Detailed disagreement point 1 with context", "Detailed disagreement point 2"],
    "neutral_summary": "Comprehensive 3-4 sentence neutral overview of the story synthesis.",
    "key_takeaway": "Detailed 2-sentence executive summary of narrative divergence."
  },
  "comparison": [
    {
      "source": "Outlet Name",
      "headline": "Headline or central claim",
      "tone": "neutral | critical | supportive | alarmed | pragmatic",
      "emphasis": "Detailed 2-3 sentence breakdown of editorial emphasis and framing stance."
    }
  ],
  "bias_analysis": {
    "spectrum_score": 0.25,
    "dominant_framing": "Detailed description of overall cluster framing",
    "loaded_phrases": [
      {
        "text": "Exact quoted phrase from article",
        "outlet": "Outlet Name",
        "bias": "left | lean_left | center | lean_right | right",
        "reason": "Detailed 2-sentence explanation of emotional charge and rhetorical intent.",
        "neutral_alternative": "Complete objective re-framing statement."
      }
    ]
  },
  "missing_perspectives": [
    {
      "angle": "Specific Omitted Stakeholder Angle",
      "description": "Detailed 2-sentence description of how this perspective was glossed over.",
      "why_it_matters": "Detailed 2-sentence explanation of societal, economic, or legal importance.",
      "missing_from_outlets": ["Exact Outlet Name A", "Exact Outlet Name B"]
    }
  ],
  "timeline": [
    {
      "published_at": "ISO timestamp or formatted time",
      "source": "Outlet Name",
      "headline": "Full article headline",
      "framing_shift": "Detailed explanation of how narrative emphasis evolved at this timestamp."
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
