import os
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load .env file 
ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)

# Flask Setup
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])


# WHO-Aligned System Instruction
WHO_SYSTEM_INSTRUCTION = """
You are Wellbot, a friendly mental health and wellness assistant.

Your role is to give specific, practical self‑care suggestions only (no diagnosis).

Rules:
1. Base advice on WHO evidence-based guidelines and common mental wellness practices.
2. Give concrete, step‑by‑step suggestions (breathing, grounding, journaling, sleep hygiene, simple exercises).
3. Always suggest seeing a doctor or mental health professional if symptoms are severe, persistent, worsening, involve self‑harm thoughts, or feel unmanageable.
4. Never diagnose, never label disorders, and never give medicine names or dosages.
5. If question is not health-related, gently redirect back to mental and emotional wellbeing topics.
6. Reply in the language requested by the user (English for 'en', Hindi for 'hi').
"""

# Load API Key and create client 
raw_key = os.environ.get("GOOGLE_API_KEY") 
api_key = raw_key.strip().strip('"').strip("'") if raw_key else None

if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None

# Model ID (see https://github.com/googleapis/python-genai)
GEMINI_MODEL = "gemini-2.5-flash"

# Health Check Route
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "wellbot-backend"})

# Chat Route
@app.route("/chat", methods=["POST"])
def chat():
    try:
        if client is None:
            return jsonify({
                "reply": "Health assistant not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY in backend/.env"
            })

        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"error": "Missing 'message' in request body"}), 400

        user_message = data["message"].strip()
        language = (data.get("language") or "en").strip().lower()

        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        if language == "hi":
            language_hint = (
                "User prefers Hindi. Reply fully in natural, simple Hindi using Devanagari script.\n\n"
            )
        else:
            language_hint = (
                "User prefers English. Reply fully in clear, simple English.\n\n"
            )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=language_hint + user_message,
            config=types.GenerateContentConfig(
                system_instruction=WHO_SYSTEM_INSTRUCTION,
            ),
        )

        bot_reply = getattr(response, "text", None) or ""
        if not bot_reply:
            bot_reply = (
                "I couldn't generate a detailed response right now. "
                "Please try asking again in a slightly different way."
            )

        return jsonify({"botReply": bot_reply})

    except Exception as e:
        print("FULL ERROR:", str(e))
        return jsonify({
            "error": str(e),
            "reply": "Something went wrong. Please try again."
        }), 500

# Run Server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)