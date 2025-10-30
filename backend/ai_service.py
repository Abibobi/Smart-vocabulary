import google.generativeai as genai
from config import settings
import json

# Configure the Gemini API client
genai.configure(api_key=settings.google_api_key)
model = genai.GenerativeModel('gemini-flash-latest')

def get_ai_word_details(word: str) -> dict:
    """
    Uses the Gemini API to get a simple definition and example sentence for a word.
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
        return json.loads(json_response)
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {
            "definition": "Could not fetch AI-powered definition.",
            "example": "Please try again later."
        }

def get_ai_word_explanation(word: str) -> dict:
    """
    Uses the Gemini API to get a definition, example, and a mnemonic for a word.
    """
    prompt = f"""
    Provide a concise definition, a clear example sentence, and a simple, easy-to-remember mnemonic for the word '{word}'.
    Return the response as a JSON object with three keys: "definition", "example", and "mnemonic".
    For example, for the word 'garrulous', the output should be:
    {{
      "definition": "Excessively talkative, especially on trivial matters.",
      "example": "The garrulous man held up the checkout line while telling the cashier his life story.",
      "mnemonic": "Imagine a GARgoyle that is always RULeS-ing the conversation by talking too much."
    }}
    """
    try:
        response = model.generate_content(prompt)
        # Clean up the response to extract the JSON part
        json_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(json_response)
    except Exception as e:
        print(f"Error calling Gemini API for explanation: {e}")
        return {
            "definition": "Could not fetch AI-powered definition.",
            "example": "Please try again later.",
            "mnemonic": "AI service is currently unavailable."
        }
    
def get_alternative_explanation(word: str, previous_example: str, previous_mnemonic: str) -> dict:
    """
    Uses the Gemini API to generate a NEW example and mnemonic for a word,
    given the previous ones to avoid repetition.
    """
    prompt = f"""
    A user is trying to understand the word '{word}'.
    They were already shown this example: "{previous_example}"
    And this mnemonic: "{previous_mnemonic}"
    
    Please provide a completely different, simpler example sentence and a new, creative mnemonic to help them understand.
    Return the response as a JSON object with two keys: "example" and "mnemonic".
    """
    try:
        response = model.generate_content(prompt)
        json_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(json_response)
    except Exception as e:
        print(f"Error calling Gemini API for alternative explanation: {e}")
        return {
            "example": "Sorry, I couldn't think of another example right now.",
            "mnemonic": "Please try adding the word and reviewing it later."
        }
    
def get_ai_word_suggestions(existing_words: list[str] = None) -> dict:
    """
    Uses the Gemini API to suggest new vocabulary words.
    """
    if existing_words:
        # User has words, suggest related ones
        word_list = ", ".join(existing_words)
        prompt = f"""
        A user is learning vocabulary and already knows these words: {word_list}.
        Suggest 5 new, intermediate-level English words that are thematically or conceptually related to the user's existing words.
        Return the response as a JSON object with a single key "suggestions" which is a list of the suggested word strings.
        For example:
        {{
          "suggestions": ["ubiquitous", "ephemeral", "eloquent", "resilient", "pragmatic"]
        }}
        """
    else:
        # User is new, suggest general words
        prompt = f"""
        A new user is starting to learn vocabulary.
        Suggest 5 interesting, intermediate-level English words for them to learn.
        Return the response as a JSON object with a single key "suggestions" which is a list of the suggested word strings.
        For example:
        {{
          "suggestions": ["ubiquitous", "ephemeral", "eloquent", "resilient", "pragmatic"]
        }}
        """
    try:
        response = model.generate_content(prompt)
        json_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(json_response)
    except Exception as e:
        print(f"Error calling Gemini API for suggestions: {e}")
        return {"suggestions": []}