from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

security = HTTPBearer(auto_error=False)


class UserProfile:
    def __init__(self, user_id: str, email: str = "demo@prismnews.ai", display_name: str = "Demo User"):
        self.id = user_id
        self.email = email
        self.display_name = display_name


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UserProfile:
    """
    Validates Supabase Bearer JWT.
    If SUPABASE_JWT_SECRET is configured, decodes token and extracts `sub` (user_id).
    If secret is not set, accepts dev token or returns default demo user for testing.
    """
    if not credentials:
        # If running without explicit JWT secret, allow dev demo user
        if not settings.SUPABASE_JWT_SECRET or settings.ENV == "development":
            return UserProfile(user_id="00000000-0000-0000-0000-000000000000", email="user@prismnews.ai", display_name="Prism Reader")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    if not settings.SUPABASE_JWT_SECRET:
        # In dev mode, return user extracted from token or default
        return UserProfile(user_id="00000000-0000-0000-0000-000000000000", email="user@prismnews.ai", display_name="Prism Reader")

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
        email: str = payload.get("email", "user@prismnews.ai")
        user_metadata = payload.get("user_metadata", {})
        display_name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
        
        return UserProfile(user_id=user_id, email=email, display_name=display_name)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
