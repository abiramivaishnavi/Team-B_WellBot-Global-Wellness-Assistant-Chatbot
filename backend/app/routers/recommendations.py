from datetime import date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from ..models.schemas import DailyCheckIn, RecommendationResponse
from ..services.ai_recommendations import generate_recommendations_from_daily_data
from ..supabase_client import get_supabase_client


router = APIRouter()


from ..dependencies import get_user_id


@router.get("/daily", response_model=RecommendationResponse)
def get_daily_recommendations(
  user_id: str = Depends(get_user_id),
  days: int = Query(default=7, ge=1, le=60),
):
  supabase = get_supabase_client()

  end = date.today()
  start = end - timedelta(days=days - 1)

  result = (
    supabase.table("daily_check_ins")
    .select("*")
    .eq("user_id", user_id)
    .gte("date", start.isoformat())
    .lte("date", end.isoformat())
    .order("date", desc=False)
    .execute()
  )

  rows = result.data or []

  daily_items: list[DailyCheckIn] = []
  for row in rows:
    daily_items.append(DailyCheckIn(**row))

  recs = generate_recommendations_from_daily_data(daily_items, start, end)

  return RecommendationResponse(recommendations=recs)

