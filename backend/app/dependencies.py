from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .supabase_client import get_supabase_client

security = HTTPBearer(auto_error=False)

def get_optional_user_id(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str | None:
    if not credentials:
        return None
    token = credentials.credentials
    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user.id
    except Exception as e:
        print("Auth error:", e)
    return None

def get_user_id(user_id: str | None = Depends(get_optional_user_id)) -> str:
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid Bearer token is required",
        )
    return user_id
