import google.generativeai as genai
from config import settings

# Configure the Gemini API client
genai.configure(api_key=settings.google_api_key)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def get_ai_word_details(word: str) -> dict:
    """
    Uses the Gemini API to get a definition and an example sentence for a word.
    """
    prompt = f"""
    Provide a concise definition and a single, clear example sentence for the word '{word}'.
    Return the response as a JSON object with two keys: "definition" and "example".
    For example, for the word 'ephemeral', the output should be:
    {{
      "definition": "Lasting for a very short time.",
      "example": "The beauty of the cherry blossoms is ephemeral, enjoyed for only a few weeks each year."
    }}
    """
    try:
        response = model.generate_content(prompt)
        # Clean up the response to extract the JSON part
        json_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        import json
        return json.loads(json_response)
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {
            "definition": "Could not fetch AI-powered definition.",
            "example": "Please try again later."
        }
