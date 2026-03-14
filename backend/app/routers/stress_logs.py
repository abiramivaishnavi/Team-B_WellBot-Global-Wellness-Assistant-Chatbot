from datetime import date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from ..models.schemas import StressLog, StressLogCreate
from ..supabase_client import get_supabase_client
from ..dependencies import get_user_id


router = APIRouter()




from ..services.ai_stress import generate_stress_protocol

@router.get("/protocol")
def get_stress_protocol(score: int = Query(default=50, ge=0, le=100), user_id: str = Depends(get_user_id)):
    """
    Dynamically generates a custom protocol based on the user's reported stress balance score.
    Returns a unified JSON object directly compatible with the StressTrackerView UI.
    """
    return generate_stress_protocol(balance_score=score, user_id=user_id)

@router.post("/", response_model=StressLog)
def create_stress_log(payload: StressLogCreate, user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()
  data = payload.model_dump()
  data["user_id"] = user_id

  result = (
    supabase.table("stress_logs")
    .insert(data)
    .execute()
  )

  if not result.data:
    raise HTTPException(status_code=500, detail="Failed to create stress log")

  return result.data[0] if isinstance(result.data, list) else result.data


@router.get("/", response_model=list[StressLog])
def list_stress_logs(
  user_id: str = Depends(get_user_id),
  start_date: date | None = Query(default=None),
  end_date: date | None = Query(default=None),
):
  supabase = get_supabase_client()

  if end_date is None:
    end_date = date.today()
  if start_date is None:
    start_date = end_date - timedelta(days=30)

  result = (
    supabase.table("stress_logs")
    .select("*")
    .eq("user_id", user_id)
    .gte("date", start_date.isoformat())
    .lte("date", end_date.isoformat())
    .order("date", desc=False)
    .execute()
  )

  return result.data or []

