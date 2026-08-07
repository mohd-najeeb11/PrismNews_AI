from typing import Optional
from app.core.config import settings
from app.core.logging import logger

_supabase_client = None


def get_supabase_client():
    """
    Singleton getter for Supabase Client with service-role privileges.
    Returns None if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is omitted.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY

    if not url or not key:
        logger.info("Supabase client initialized in offline/seed fallback mode (missing URL/Key)")
        return None

    # Strip trailing /rest/v1 if provided in URL
    clean_url = url.rstrip('/')
    if clean_url.endswith('/rest/v1'):
        clean_url = clean_url[:-8].rstrip('/')

    try:
        from supabase import create_client, Client
        logger.info(f"Initializing live Supabase client for project {clean_url}...")
        _supabase_client = create_client(clean_url, key)
        logger.info("Supabase client successfully initialized!")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None
