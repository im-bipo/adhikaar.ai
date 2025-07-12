import os
import httpx
import json
from database import top_k_chunks 
from fastapi import HTTPException
from dotenv import load_dotenv





load_dotenv()

API_KEY = os.getenv("API")
MODEL = os.getenv("grok_model")

# Function to handle the model interaction
async def model(user_query: str , translated_query: str) -> dict:
        # Get top-k chunks from the database
        top_chunks = [ chunk for chunk in top_k_chunks(translated_query) ]
        top_chunks_texts = [chunk["metadata"]["text"] for chunk in top_chunks]
        print("top_chunks :" , top_chunks)
        if top_chunks[0]["score"] < 0.7 :
            pass
        else :
            prompt = f"""
                        You are Adhikaar.ai — a trustworthy legal assistant.

                        Your job is to answer the user's query **only using the context** below. If there is enough relevant legal information, answer in the same language as the original query, citing the document and location.

                        - If the answer **is found**, return a JSON like:
                        {{
                        "answer": "<Answer in original query language. Cite document, Part, Chapter, Article, or Schedule if mentioned.>",
                        "fallback": false
                        }}

                        - If the answer **cannot** be found in the context, return:
                        {{
                        "answer": "",
                        "fallback": true
                        }}

                        ### Original User Query:
                        {user_query}

                        ### Translated English Query:
                        {translated_query}

                        ### Context:
                        {top_chunks}
                        """
            headers = {
                "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                }
            payload = {
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 600
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

            # Extract raw content string from the assistant message
            content_raw = data["choices"][0]["message"]["content"].strip()
            try:
                content_dict = json.loads(content_raw)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail=f"JSON parsing error: {str(e)}")

            return content_dict

       
# import asyncio
# asyncio.run(model("What is the legal age for marriage in nepal?", "What is the legal age for marriage in neapl?"))