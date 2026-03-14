import json
from google import genai
from ..config import get_settings

def _get_client():
    settings = get_settings()
    if not settings.google_api_key:
        return None
    return genai.Client(api_key=settings.google_api_key)

def generate_meal_plan(calories: int, diet_preference: str) -> dict:
    client = _get_client()
    if not client:
        return {
            "error": "AI recommendations are currently unavailable. Please configure the API key."
        }

    prompt = f"""You are a certified nutritionist. Generate a 1-day meal plan for a {diet_preference} diet targeting exactly {calories} calories.
Create distinct meals for Breakfast, Lunch, Snack, and Dinner.
Make it healthy, delicious, and realistic.

Return the response STRICTLY as a valid JSON object matching this schema and NOTHING else. Do not use markdown blocks:
{{
  "response": "A short, encouraging personalized response from you (an AI Nutritionist) offering 3 bulleted tips and explaining why this plan fits their diet.",
  "Breakfast": {{"name": "string", "kcal": integer, "items": ["ingredient1", "ingredient2"]}},
  "Lunch": {{"name": "string", "kcal": integer, "items": ["ingredient1", "ingredient2"]}},
  "Snack": {{"name": "string", "kcal": integer, "items": ["ingredient1", "ingredient2"]}},
  "Dinner": {{"name": "string", "kcal": integer, "items": ["ingredient1", "ingredient2"]}}
}}
"""
    # Try a list of models in order of preference
    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"]
    last_error = None

    for model_name in models_to_try:
        try:
            print(f"  - Attempting generation with {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            text = getattr(response, "text", "") or ""
            text = text.replace("```json", "").replace("```", "").strip()
            
            plan = json.loads(text)
            print(f"  - Successfully generated plan using {model_name}")
            return plan
        except Exception as e:
            last_error = e
            print(f"  - {model_name} failed: {e}")
            continue

    print(f"Meal plan generation failed all models. Last error: {last_error}")
    # If all AI models are exhausted or failing, return a high-quality standard plan
    return _get_standard_plan(calories, is_exhausted=True)

def _get_standard_plan(calories: int, is_exhausted: bool = False) -> dict:
    """Returns a high-quality standard meal plan when AI is unavailable."""
    msg = "Here is a standard healthy meal plan for you. We were unable to generate personalized advice at this moment."
    if is_exhausted:
        msg = "Our AI Nutritionist is taking a short break due to high demand! Here is a balanced standard plan for your target calories."

    return {
        "response": msg,
        "Breakfast": {"name": "Oatmeal with Almonds & Berries", "kcal": 350, "items": ["1/2 cup oats", "1 tbsp almonds", "1/2 cup blueberries"]},
        "Lunch": {"name": "Quinoa & Roasted Vegetable Bowl", "kcal": 450, "items": ["1/2 cup quinoa", "Roasted broccoli", "Chickpeas", "Tahini dressing"]},
        "Snack": {"name": "Greek Yogurt with Honey", "kcal": 200, "items": ["1 cup Greek yogurt", "1 tsp honey"]},
        "Dinner": {"name": "Grilled Protein & Asparagus", "kcal": max(calories - 1000, 400), "items": ["Lean protein source", "Grilled asparagus", "Sweet potato"]}
    }

def generate_macro_goals(weight_kg: float, height_cm: float, bmi: float, diet_preference: str) -> dict:
    client = _get_client()
    if not client:
        return _fallback_macros(bmi)

    prompt = f"""You are an expert sports nutritionist. Calculate optimal daily calorie and macronutrient targets for a client with the following profile:
- Weight: {weight_kg} kg
- Height: {height_cm} cm
- BMI: {bmi}
- Diet Preference: {diet_preference}

Return the response STRICTLY as a valid JSON object matching this schema and NOTHING else. Do not use markdown blocks:
{{
  "target_calories": integer,
  "target_protein": integer,
  "target_carbs": integer,
  "target_fats": integer
}}

Notes:
- If BMI is < 18.5, they need a slight caloric surplus to gain weight healthily.
- If BMI is > 25, they need a slight caloric deficit to lose weight healthily.
- Protein should align with their goals (generally 1.6-2.2g per kg of body weight).
- Ensure the macros roughly add up to the total target calories (Protein=4kcal/g, Carbs=4kcal/g, Fats=9kcal/g).
"""
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        text = getattr(response, "text", "") or ""
        text = text.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            print("Failed to decode macro JSON from AI:", text)
            return _fallback_macros(bmi)
            
    except Exception as e:
        print("Macro generation error:", e)
        return _fallback_macros(bmi)

def _fallback_macros(bmi: float) -> dict:
    target_calories = 2000
    if bmi < 18.5: target_calories = 2500
    elif bmi > 25: target_calories = 1800
    
    return {
        "target_calories": target_calories,
        "target_protein": int((target_calories * 0.3) / 4.0),
        "target_carbs": int((target_calories * 0.5) / 4.0),
        "target_fats": int((target_calories * 0.2) / 9.0)
    }
