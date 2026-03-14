from fastapi import APIRouter, Depends, HTTPException, status

from ..models.schemas import Profile, ProfileUpdate
from ..supabase_client import get_supabase_client
from ..dependencies import get_user_id


router = APIRouter()


@router.get("/count")
def get_user_count(user_id: str = Depends(get_user_id)):
  """Return total number of registered users. Uses service key, bypasses RLS."""
  try:
    supabase = get_supabase_client()
    # Try getting the count from the profiles table
    result = supabase.table("profiles").select("id", count="exact").execute()
    
    count = 0
    # Handle both object-based (new) and dict-based (old) supabase-py responses
    if hasattr(result, "count") and result.count is not None:
      count = result.count
    elif isinstance(result, dict) and "count" in result:
      count = result["count"]
    elif hasattr(result, "data") and result.data is not None:
      count = len(result.data)
    elif isinstance(result, dict) and "data" in result:
      count = len(result["data"] or [])
      
    return {"count": count}
  except Exception as e:
    print(f"Error fetching user count: {e}")
    # Return 1 as fallback (the current user) if we can't fetch the total
    return {"count": 1}


@router.get("/me", response_model=Profile)
def get_my_profile(user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()
  result = (
    supabase.table("profiles")
    .select("*")
    .eq("id", user_id)
    .limit(1)
    .execute()
  )

  if not result.data:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

  return result.data[0] if isinstance(result.data, list) else result.data


@router.patch("/me", response_model=Profile)
def update_my_profile(payload: ProfileUpdate, user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()
  update_data = {k: v for k, v in payload.model_dump().items() if v is not None}

  if not update_data:
    return get_my_profile(user_id)

  result = (
    supabase.table("profiles")
    .update(update_data)
    .eq("id", user_id)
    .execute()
  )

  if not result.data:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

  return result.data[0] if isinstance(result.data, list) else result.data
