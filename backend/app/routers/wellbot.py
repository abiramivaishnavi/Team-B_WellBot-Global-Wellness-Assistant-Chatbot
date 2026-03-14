from typing import List

from google import genai
from google.genai import types
from fastapi import APIRouter, Depends, Header, HTTPException

from ..config import get_settings
from ..models.schemas import ChatRequest, ChatResponse, WellbotMessage
from ..supabase_client import get_supabase_client
from ..dependencies import get_user_id


router = APIRouter()


WHO_SYSTEM_INSTRUCTION = """
You are Wellbot, a friendly health and wellness assistant.

Your primary directive is to give helpful, actionable first-aid and wellness suggestions FIRST.

Rules:
1. Base advice on WHO evidence-based guidelines.
2. For ANY minor issue (dizziness, mild headache, fever, cold, minor pain), you MUST immediately provide 3-4 concrete action steps (e.g. hydrate with electrolytes, rest with elevated legs, take OTC paracetamol).
3. Provide your advice FIRST. Be extremely warm, empathetic, and practical.
4. ONLY at the very end of your message, you may add a short, polite disclaimer to see a doctor if symptoms persist or worsen. Do NOT start your message with a disclaimer.
5. Never diagnose conditions or provide exact pharmacological dosages.
6. If the question is not health-related, politely redirect to health topics.
"""

def get_gemini_client():
  settings = get_settings()
  if not settings.google_api_key:
      return None
  return genai.Client(api_key=settings.google_api_key)


@router.post("/message", response_model=ChatResponse)
def send_message(payload: ChatRequest, user_id: str = Depends(get_user_id)):
  supabase = get_supabase_client()

  # Fetch recent conversation history
  history_rows: List[WellbotMessage] = []
  try:
    history_result = (
      supabase.table("wellbot_messages")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", desc=True)
      .limit(10)
      .execute()
    )

    history_rows = [
      WellbotMessage(**row) for row in (history_result.data or [])
    ]
    history_rows.reverse()
  except Exception as e:
    print("Warning: Could not fetch wellbot_messages history:", e)
    # Continue without history if table doesn't exist yet

  language = (payload.language or "en").strip().lower()

  if language == "hi":
    language_hint = "User prefers Hindi. Reply fully in natural, simple Hindi using Devanagari script.\n\n"
  else:
    language_hint = "User prefers English. Reply fully in clear, simple English.\n\n"

  # Build conversation text
  lines: List[str] = [language_hint]

  for msg in history_rows:
    prefix = "User" if msg.role == "user" else "WellBot"
    lines.append(f"{prefix}: {msg.content}")

  lines.append(f"User: {payload.message}")
  lines.append("WellBot:")

  prompt = "\n".join(lines)

  client = get_gemini_client()
  if not client:
      raise HTTPException(status_code=500, detail="Health assistant not configured. Please set GOOGLE_API_KEY in backend/.env")

  try:
      response = client.models.generate_content(
          model="gemini-2.5-flash",
          contents=prompt,
          config=types.GenerateContentConfig(
              system_instruction=WHO_SYSTEM_INSTRUCTION,
          ),
      )
      reply_text = getattr(response, "text", None) or ""
  except Exception as e:
      print("Wellbot Generation Error:", e)
      raise HTTPException(status_code=500, detail="Failed to generate reply")

  if not reply_text:
    raise HTTPException(status_code=500, detail="Failed to generate reply")

  # Persist messages
  try:
      supabase.table("wellbot_messages").insert(
        [
          {"user_id": user_id, "role": "user", "content": payload.message},
          {"user_id": user_id, "role": "assistant", "content": reply_text},
        ]
      ).execute()
  except Exception as e:
      print("Warning: Could not save wellbot_messages:", e)

  return ChatResponse(reply=reply_text)

