import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class Profile(BaseModel):
  id: str
  name: Optional[str] = None
  preferred_language: Optional[str] = None
  created_at: Optional[datetime.datetime] = None
  updated_at: Optional[datetime.datetime] = None


class ProfileUpdate(BaseModel):
  name: Optional[str] = None
  preferred_language: Optional[str] = None


class DailyCheckInBase(BaseModel):
  date: datetime.date = Field(description="Date of the check-in")
  mood: int = Field(ge=1, le=10)
  stress: int = Field(ge=1, le=10)
  energy: int = Field(ge=1, le=10)
  sleep_hours: float = Field(ge=0, le=24)
  hydration_glasses: Optional[int] = Field(ge=0, default=0)
  goals_json: Optional[List[dict]] = None
  notes: Optional[str] = None


class DailyCheckInCreate(DailyCheckInBase):
  pass


class DailyCheckIn(DailyCheckInBase):
  id: int
  user_id: str
  created_at: datetime.datetime
  updated_at: Optional[datetime.datetime] = None


class StressLogBase(BaseModel):
  date: datetime.date = Field(description="Date of the stress event")
  stress: int = Field(ge=1, le=10)
  trigger: Optional[str] = None
  coping_strategy: Optional[str] = None
  notes: Optional[str] = None


class StressLogCreate(StressLogBase):
  pass


class StressLog(StressLogBase):
  id: int
  user_id: str
  created_at: datetime.datetime


class NutritionLogBase(BaseModel):
  date: datetime.date = Field(description="Date of the meal")
  meal_type: str = Field(description="Meal type, e.g. breakfast/lunch/dinner/snack")
  description: str
  calories: Optional[int] = Field(default=None, ge=0)
  satisfaction: Optional[int] = Field(default=None, ge=1, le=10)


class NutritionLogCreate(NutritionLogBase):
  pass


class NutritionLog(NutritionLogBase):
  id: int
  user_id: str
  created_at: datetime.datetime


class FeedbackCreate(BaseModel):
  rating: int = Field(ge=1, le=5)
  category: Optional[str] = None
  comment: Optional[str] = None
  anonymous: bool = False


class Feedback(BaseModel):
  id: int
  user_id: Optional[str] = None
  rating: int
  category: Optional[str] = None
  comment: Optional[str] = None
  created_at: datetime.datetime


class Recommendation(BaseModel):
  id: int
  user_id: str
  generated_for_start: datetime.date
  generated_for_end: datetime.date
  content: str
  created_at: datetime.datetime


class RecommendationResponse(BaseModel):
  recommendations: List[str]


class ChatRequest(BaseModel):
  message: str
  language: str | None = "en"


class ChatResponse(BaseModel):
  reply: str


class WellbotMessage(BaseModel):
  id: int
  user_id: str
  role: str
  content: str
  created_at: datetime.datetime


class NutritionGoalCreate(BaseModel):
  weight_kg: float = Field(gt=0)
  height_cm: float = Field(gt=0)
  diet_preference: str = Field(default="Vegetarian")


class NutritionGoal(BaseModel):
  id: str
  user_id: str
  weight_kg: float
  height_cm: float
  bmi: float
  diet_preference: str
  target_calories: int
  target_protein: int
  target_carbs: int
  target_fats: int
  updated_at: datetime.datetime


class MealPlan(BaseModel):
  id: str
  user_id: str
  date: datetime.date
  diet_type: str
  calories: int
  plan_json: dict
