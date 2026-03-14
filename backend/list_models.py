
import os
from google import genai
from dotenv import load_dotenv

def list_models():
    load_dotenv()
    key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=key)
    
    print("Available models:")
    try:
        models = client.models.list()
        for m in models:
            print(f"- {m.name}")
    except Exception as e:
        print("Error listing models:", e)

if __name__ == "__main__":
    list_models()
