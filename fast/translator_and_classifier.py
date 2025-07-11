import os
import httpx
import json
from fastapi import HTTPException
from dotenv import load_dotenv




load_dotenv()

API_KEY = os.getenv("API")
MODEL = os.getenv("translater_and_classifier_model", "llama3-70b-8192")



async def translate_and_classify(user_query) :
        prompt = f""" 
            You are adhikaar.ai, a highly accurate and responsible legal language processor and query classifier designed to assist users with legal queries in Nepali, Romanized Nepali, and informal English.

            Your task is twofold:

            1. Classify the user's input query strictly into one of these two categories:
            - "general_chat" (simple greetings, chit-chat, or unrelated to legal matters)
            - "legal_query" (any question or statement seeking legal information or advice)

            2. If classified as legal_query, translate the input into fluent, clear, and standard English without changing or omitting any legal meaning or detail. Preserve all intent and context exactly.
            3. If classified as general_chat,  respond with a short friendly reply in  same language as User_query .

            Important constraints:

            - Do not hallucinate or add any information.
            - Do not include anything except a valid JSON object in the exact format below.
            - No explanations, no extra text.
            - Strictly give answer to user query 

            Output JSON format exactly as follows:
            {{
            "category": "<either 'general_chat' or 'legal_query'>",
            "response": "<standard English translation if legal_query; reply if general_chat>"
            }}

            User_query:
            "{user_query}"
            """



        headers = {
        "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 100
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

        data = response.json()
        print(data["choices"][0]["message"])
         # Extract raw content string from the assistant message
        content_raw = data["choices"][0]["message"]["content"].strip()
        

        # content_dict = json.loads(content_raw)
        # Convert JSON string to Python dict
        try:
            content_dict = json.loads(content_raw)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"JSON parsing error: {str(e)}")

        return content_dict


import asyncio

async def demo():
    user_query = "the fing query"
    result = await translate_and_classify(user_query)
    print("result" , result)

asyncio.run(demo())
 # Example usage for testing