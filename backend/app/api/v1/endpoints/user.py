from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import UserProfile, get_current_user

router = APIRouter()


class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    avatar_url: str = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"


@router.get("/me", response_model=UserProfileResponse, summary="Get Current User Profile")
async def get_me(user: UserProfile = Depends(get_current_user)) -> UserProfileResponse:
    """
    Returns current authenticated user profile.
    """
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
    )
