import json
from google import genai
from ..config import get_settings

def _get_client():
    settings = get_settings()
    if not settings.google_api_key:
        return None
    return genai.Client(api_key=settings.google_api_key)

def generate_stress_protocol(balance_score: int, user_id: str) -> dict:
    client = _get_client()
    if not client:
        return _fallback_protocol(balance_score)

    prompt = f"""You are a certified wellness coach and psychologist. A user has indicated their current stress/balance score is {balance_score} out of 100 on our Tracker slider (0 is critically maxed out stress, 100 is perfectly optimal relaxation).

Analyze this score and generate a customized recommended protocol to help them manage their current state.

Return the response STRICTLY as a valid JSON object matching this schema and NOTHING else. Do not use markdown blocks:
{{
  "key": "dynamic",
  "label": "A short 1-word urgency label (e.g. CRITICAL, ELEVATED, MANAGED, OPTIMAL)",
  "emoji": "A single relevant emoji",
  "range": "Just mirror the score e.g. '{balance_score} / 100'",
  "color": "A Tailwind CSS background color class matching the urgency (e.g. 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-emerald-500')",
  "light": "A Tailwind CSS background/border/text combo for the description box (e.g. 'bg-red-50 border-red-200 text-red-700')",
  "badge": "A Tailwind CSS combo for the top label (e.g. 'bg-red-100 text-red-700')",
  "sliderAccent": "A matching hex code color for the range slider (e.g. '#ef4444')",
  "desc": "A highly personalized 2-sentence encouraging explanation of their state and why these exercises help.",
  "intensity": "A 2-word protocol title (e.g. 'Grounding Protocol', 'Maintenance Protocol')",
  "exercises": [
    {{
      "name": "Exercise 1 Name", 
      "meta": "Short subtext instruction", 
      "icon": "One of these exact strings: 'Wind', 'Leaf', 'Music', 'Dumbbell', 'PenLine', 'Eye', 'PersonStanding', 'Footprints', 'Droplets'"
    }},
    {{
      "name": "Exercise 2 Name", 
      "meta": "Short subtext instruction", 
      "icon": "One of these exact strings: 'Wind', 'Leaf', 'Music', 'Dumbbell', 'PenLine', 'Eye', 'PersonStanding', 'Footprints', 'Droplets'"
    }}
  ]
}}
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = getattr(response, "text", "") or ""
        
        # Clean markdown codeblocks
        text = text.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            print("Failed to decode dynamic stress protocol JSON from AI:", text)
            return _fallback_protocol(balance_score)
            
    except Exception as e:
        print("Stress Protocol generation error:", e)
        return _fallback_protocol(balance_score)

def _fallback_protocol(score: int) -> dict:
    if score <= 25:
        return {
            "key": "critical", "label": "CRITICAL", "emoji": "🔴", "range": f"{score} / 100",
            "color": "bg-red-500", "light": "bg-red-50 border-red-200 text-red-700",
            "badge": "bg-red-100 text-red-700", "sliderAccent": "#ef4444",
            "desc": "Immediate intervention needed. High cortisol detected. Stop, breathe, and follow these exercises.",
            "intensity": "Extended Protocol",
            "exercises": [
                {"name": "Box Breathing", "meta": "4s In • 4s Hold • 4s Out", "icon": "Wind"},
                {"name": "Grounding (5-4-3-2-1)", "meta": "Identify 5 things you see", "icon": "Eye"}
            ]
        }
    elif score <= 50:
        return {
            "key": "high", "label": "HIGH", "emoji": "🟠", "range": f"{score} / 100",
            "color": "bg-orange-500", "light": "bg-orange-50 border-orange-200 text-orange-700",
            "badge": "bg-orange-100 text-orange-700", "sliderAccent": "#f97316",
            "desc": "Elevated stress. Regular breaks, hydration, and targeted exercises are strongly recommended.",
            "intensity": "Standard Protocol",
            "exercises": [
                {"name": "Progressive Muscle Relaxation", "meta": "Tense & release muscle groups", "icon": "Dumbbell"},
                {"name": "Nature Soundscape", "meta": "5-minute immersive audio", "icon": "Music"}
            ]
        }
    elif score <= 75:
        return {
            "key": "moderate", "label": "MODERATE", "emoji": "🟡", "range": f"{score} / 100",
            "color": "bg-yellow-400", "light": "bg-yellow-50 border-yellow-200 text-yellow-700",
            "badge": "bg-yellow-100 text-yellow-700", "sliderAccent": "#facc15",
            "desc": "Manageable stress. A couple of simple exercises will keep you balanced.",
            "intensity": "Mild Protocol",
            "exercises": [
                {"name": "Mindful Scribble", "meta": "2-minute freehand drawing", "icon": "PenLine"},
                {"name": "Quick Stretch", "meta": "Shoulder & neck release", "icon": "PersonStanding"}
            ]
        }
    else:
        return {
            "key": "optimal", "label": "OPTIMAL", "emoji": "🟢", "range": f"{score} / 100",
            "color": "bg-emerald-500", "light": "bg-emerald-50 border-emerald-200 text-emerald-700",
            "badge": "bg-emerald-100 text-emerald-700", "sliderAccent": "#10b981",
            "desc": "You are in balance. Optional light practice to maintain this state.",
            "intensity": "Maintenance Protocol",
            "exercises": [
                {"name": "Gratitude Check", "meta": "Note one good thing", "icon": "Leaf"},
                {"name": "Light Walk", "meta": "Brief movement break", "icon": "Footprints"}
            ]
        }
