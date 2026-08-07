import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import get_supabase_client

def main():
    print("=== Testing Live Supabase Connection & Tables ===")
    client = get_supabase_client()
    if not client:
        print("[FAIL] Supabase client could not be initialized")
        return

    try:
        # Check stories table
        resp = client.table("stories").select("*").limit(5).execute()
        print(f"[OK] Supabase 'stories' table query successful: {len(resp.data)} records found")
    except Exception as e:
        print(f"[NOTE] 'stories' table query: {e}")

    try:
        # Check saved_stories table
        resp = client.table("saved_stories").select("*").limit(5).execute()
        print(f"[OK] Supabase 'saved_stories' table query successful: {len(resp.data)} records found")
    except Exception as e:
        print(f"[NOTE] 'saved_stories' table query: {e}")

if __name__ == "__main__":
    main()
