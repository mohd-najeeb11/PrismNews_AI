import asyncio
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.ai_analysis import ai_analysis_service

async def main():
    print("=== Testing Live AI Analysis Service ===")
    test_story = {
        "id": "test_ai_story_1",
        "headline": "Global Climate Summit Reaches Landmark Accord on Clean Energy Transition",
        "articles": [
            {
                "title": "Nations Commit to Renewable Energy Expansion at Summit",
                "source": "Reuters",
                "content": "Delegates from over 190 countries finalized an agreement to accelerate clean energy investment."
            },
            {
                "title": "Climate Agreement Faces Skepticism Over Implementation Timelines",
                "source": "Wall Street Journal",
                "content": "Industry analysts warn that ambitious renewable targets face infrastructure and grid bottleneck challenges."
            }
        ]
    }

    result = await ai_analysis_service.analyze_story(test_story)
    print("\n--- Analysis Result Keys ---")
    print(list(result.keys()))
    print("\n--- Neutral Summary ---")
    print(result.get("balanced_summary", {}).get("neutral_summary"))
    print("\n--- Consensus Facts ---")
    print(result.get("balanced_summary", {}).get("consensus_facts"))

if __name__ == "__main__":
    asyncio.run(main())
