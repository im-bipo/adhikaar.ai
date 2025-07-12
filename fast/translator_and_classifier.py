import os
import httpx
import json
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API")
MODEL = os.getenv("translater_and_classifier_model")

def force_json_format_prompt(user_query: str, model_output: str) -> str:
    return f'''
You are a JSON formatting assistant. Your job is to turn the given input into a valid JSON object following this format:

{{
  "language": "<English | Nepali Devanagari | Nepali Romanized>",
  "category": "<legal_query | general_chat | unsupported | harmful_intent>",
  "response": "<translated query if legal_query, otherwise reply>"
}}

Input:
- User Query: "{user_query}"
- Raw Model Output: "{model_output}"

Output ONLY the valid JSON object. No extra text.
'''

async def translate_and_classify(user_query: str) -> dict:
    prompt = f'''
You are adhikaar.ai, a legally responsible AI assistant for handling user queries in Nepali (Devanagari), Romanized Nepali, or English.

Your task:
1. Detect the language of the query as one of: "English", "Nepali Devanagari", "Nepali Romanized" → store as "language"
2. Classify the query into one of: "legal_query", "general_chat", "unsupported", "harmful_intent"
3. Respond:
- If "legal_query": Translate the query into fluent English (do not answer it).
- If "general_chat" or "unsupported": Reply briefly in the same language.
- If "harmful_intent": Respond in same language with: "That action is morally wrong, harmful, and illegal. I cannot help with this request, and it may have legal consequences."

Output format (JSON only):
{{
  "language": "<English | Nepali Devanagari | Nepali Romanized>",
  "category": "<legal_query | general_chat | unsupported | harmful_intent>",
  "response": "<translated query if legal_query, otherwise reply>"
}}

User_query: "{user_query}"
'''

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 150
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15.0
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Groq API error")

    try:
        data = response.json()
        content_raw = data["choices"][0]["message"]["content"].strip()
        print("🧠 Raw content:", content_raw)
        return json.loads(content_raw)

    except Exception:
        prompt_json = force_json_format_prompt(user_query, content_raw)

        async with httpx.AsyncClient() as client:
            fix_response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt_json}],
                    "temperature": 0,
                    "max_tokens": 150
                },
                timeout=15.0
            )

        if fix_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Groq API error (fallback)")

        fixed_raw = fix_response.json()["choices"][0]["message"]["content"].strip()

        try:
            return json.loads(fixed_raw)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to parse fixed response as JSON.")


