from datetime import date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from ..models.schemas import NutritionLog, NutritionLogCreate, NutritionGoal, NutritionGoalCreate, MealPlan
from ..supabase_client import get_supabase_client
from ..dependencies import get_user_id


router = APIRouter()





@router.post("/", response_model=NutritionLog)
def create_nutrition_log(payload: NutritionLogCreate, user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()
  data = payload.model_dump()
  data["user_id"] = user_id

  result = (
    supabase.table("nutrition_logs")
    .insert(data)
    .execute()
  )

  if not result.data:
    raise HTTPException(status_code=500, detail="Failed to create nutrition log")

  return result.data[0] if isinstance(result.data, list) else result.data


@router.get("/", response_model=list[NutritionLog])
def list_nutrition_logs(
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
    supabase.table("nutrition_logs")
    .select("*")
    .eq("user_id", user_id)
    .gte("date", start_date.isoformat())
    .lte("date", end_date.isoformat())
    .order("date", desc=False)
    .execute()
  )

  return result.data or []


@router.post("/goals", response_model=NutritionGoal)
def set_nutrition_goals(payload: NutritionGoalCreate, user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()
  
  # Calculate BMI: weight (kg) / [height (m)]^2
  height_m = payload.height_cm / 100.0
  bmi = payload.weight_kg / (height_m * height_m)
  
  # Generate calorie/macro targets using AI
  from ..services.ai_nutrition import generate_macro_goals
  macros = generate_macro_goals(
      weight_kg=payload.weight_kg,
      height_cm=payload.height_cm,
      bmi=round(bmi, 1),
      diet_preference=payload.diet_preference
  )
  
  target_calories = macros.get("target_calories", 2000)
  target_protein = macros.get("target_protein", 150)
  target_carbs = macros.get("target_carbs", 250)
  target_fats = macros.get("target_fats", 45)
  
  data = {
      "user_id": user_id,
      "weight_kg": payload.weight_kg,
      "height_cm": payload.height_cm,
      "diet_preference": payload.diet_preference,
      "bmi": round(bmi, 1),
      "target_calories": target_calories,
      "target_protein": target_protein,
      "target_carbs": target_carbs,
      "target_fats": target_fats
  }

  # Upsert using ON CONFLICT logic (user_id is unique)
  result = supabase.table("nutrition_goals").upsert(
      data, on_conflict="user_id"
  ).execute()

  return result.data[0] if result.data and len(result.data) > 0 else data


@router.get("/goals", response_model=NutritionGoal)
def get_nutrition_goals(user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()
  
  result = supabase.table("nutrition_goals").select("*").eq("user_id", user_id).limit(1).execute()
  if not result.data:
      raise HTTPException(status_code=404, detail="Goals not set")
      
  return result.data[0] if isinstance(result.data, list) else result.data


@router.get("/meal-plan", response_model=MealPlan)
def get_daily_meal_plan(user_id: str = Depends(get_user_id), regenerate: bool = Query(False)):
  supabase = get_supabase_client()
  today = date.today()
  
  # 1. Fetch user goals to pass to AI
  goals_res = supabase.table("nutrition_goals").select("target_calories, diet_preference").eq("user_id", user_id).limit(1).execute()
  if not goals_res.data:
      raise HTTPException(status_code=400, detail="Set your BMI and diet preferences first")
      
  goal_data = goals_res.data[0] if isinstance(goals_res.data, list) else goals_res.data
  cals, diet = goal_data["target_calories"], goal_data["diet_preference"]
  
  # 2. Check if meal plan already exists for today
  if not regenerate:
      plan_res = supabase.table("meal_plans").select("*").eq("user_id", user_id).eq("date", today.isoformat()).limit(1).execute()
      
      if plan_res.data:
          return plan_res.data[0] if isinstance(plan_res.data, list) else plan_res.data
      
  # 3. If no plan or regenerate=True, ask Gemini to generate one
  from ..services.ai_nutrition import generate_meal_plan
  ai_plan = generate_meal_plan(cals, diet)
  
  data = {
      "user_id": user_id,
      "date": today.isoformat(),
      "diet_type": diet,
      "calories": cals,
      "plan_json": ai_plan
  }
  
  # Insert or update into cache
  if regenerate:
      insert_res = supabase.table("meal_plans").upsert(data, on_conflict="user_id,date").execute()
  else:
      insert_res = supabase.table("meal_plans").insert(data).execute()
      
  return insert_res.data[0] if insert_res.data and len(insert_res.data) > 0 else data

