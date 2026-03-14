from datetime import date
from typing import List

from google import genai

from ..config import get_settings
from ..models.schemas import DailyCheckIn


def _get_client():
  settings = get_settings()
  if not settings.google_api_key:
    return None
  return genai.Client(api_key=settings.google_api_key)


def build_daily_summary_prompt(daily_checkins: List[DailyCheckIn], start: date, end: date) -> str:
  lines = [
    "You are a wellbeing coach. Based on the user's daily mood, stress, energy and sleep data,",
    "generate 3-5 concrete, empathetic recommendations to improve wellbeing.",
    "",
    f"Data range: {start.isoformat()} to {end.isoformat()}",
    "",
    "Daily entries (one per line, format: date | mood | stress | energy | sleep_hours | notes):",
  ]

  for c in daily_checkins:
    lines.append(
      f"{c.date.isoformat()} | mood={c.mood} | stress={c.stress} | energy={c.energy} | "
      f"sleep_hours={c.sleep_hours} | notes={c.notes or ''}"
    )

  lines.append("")
  lines.append(
    "Return exactly 3 distinct recommendations. Format them strictly as a numbered list of 3 one-liners (maximum 15 words each). Do NOT use paragraphs or extra symbols."
  )

  return "\n".join(lines)


def generate_recommendations_from_daily_data(
  daily_checkins: List[DailyCheckIn],
  start: date,
  end: date,
) -> List[str]:
  if not daily_checkins:
    return ["No daily data available for this period. Encourage the user to log check-ins regularly."]

  client = _get_client()
  if not client:
    return ["AI recommendations are currently unavailable. Please configure the API key."]

  prompt = build_daily_summary_prompt(daily_checkins, start, end)
  
  try:
    response = client.models.generate_content(
      model="gemini-2.5-flash",
      contents=prompt,
    )
    text = getattr(response, "text", "") or ""
  except Exception as e:
    error_msg = str(e)
    print("Recommendation generation error:", error_msg)
    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
        return [
            "You've hit the AI speed limit (free tier).", 
            "Please wait about 60 seconds.", 
            "Then refresh the page to see your insights!"
        ]
    return ["Unable to generate recommendations right now. Please try again later."]
  lines = [line.strip() for line in text.split("\n") if line.strip()]

  cleaned: List[str] = []
  for line in lines:
    cleaned.append(line.lstrip("0123456789. ").strip())

  return [c for c in cleaned if c]

