import os
import httpx
import json
from database import top_k_chunks 
from fastapi import HTTPException
from dotenv import load_dotenv
import google.generativeai as genai







load_dotenv()

API_KEY = os.getenv("API")
MODEL = os.getenv("grok_model")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Setup Gemini client
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-pro") 


async def search_web_with_llm(original_query:str , translated_query:str) -> dict:
    prompt = f"""
        You are Adhikaar.ai — a responsible legal AI assistant with access to web search tools.

        Your job is to search the web and find official legal information of Nepal to accurately answer the user's question. Use only data from trusted legal websites, such as:

        - National Law Commission of Nepal (lawcommission.gov.np)
        - Nepal Law Portal (nepallaw.gov.np)
        - Ministry of Law, Justice and Parliamentary Affairs (molcpa.gov.np)
        - Nepal's Constitution, Civil Code, Criminal Code
        - Official government gazettes or law PDFs

        Your Steps:
        1. Use your web search tools to find the most relevant Nepali law, article, or section.
        2. Extract the exact legal answer and cite the source clearly.
        3. Format your final response strictly in this JSON format:

        {
        "message": "<Legal answer in the same language as the user's original query>",
        "reference": "<Nepal Constitution, Part X, Article Y - title of law>",
        "category": "<family lawyer | criminal lawyer | civil lawyer | constitutional lawyer | property lawyer | corporate lawyer | labor lawyer | human rights lawyer | cyber lawyer | environmental lawyer | immigration lawyer | tax lawyer | intellectual property lawyer | contract lawyer>",
        "type": "legal_query"
        }

        If no law is found or it's unrelated to Nepal, return:

        {
        "message": "",
        "reference": "",
        "category": "",
        "type": "legal_query"
        }

        Original User Query:
        {original_query}

        Translated English Query:
        {translated_query}
        """
    try:
        response = await model.generate_content(prompt)
        print(response.text)
        response_text = response.text.strip()

        # Attempt to load the model output as JSON
        return json.loads(response_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini fallback failed: {e}")
    




# Function to handle the model interaction
async def model(user_query: str , translated_query: str) -> dict:
        # Get top-k chunks from the database
        top_chunks = [ chunk for chunk in top_k_chunks(translated_query) ]
        top_chunks_texts = [chunk["metadata"]["text"] for chunk in top_chunks]

        print("top_chunks retrived ")
        print("top chunks")
        print(top_chunks_texts)


        if not top_chunks or top_chunks[0].get("score", 0) < 0.7:
                print("No relevant legal info. Using Gemini fallback.")
                return await search_web_with_llm(user_query, translated_query)

        else :
            prompt = f"""
                    You are Adhikaar.ai — a trustworthy legal assistant that answers user queries about Nepali law using the provided legal context.

                    Your response must follow this JSON format:
                    {{
                    "message": "<Answer in the user's original language if context is sufficient, and in markdown format with titles for, immediate action, legal advice, and next steps.>",
                    "reference": ["<Legal source reference like Constitution of Nepal, Part 3, Article 17>"],
                    "category": ["<Recommended type of lawyer or legal domain — e.g., constitutional lawyer, civil lawyer, criminal defense lawyer, family lawyer, etc.>"],
                    "type": "legal_query"
                    }}

                    Instructions:
                    - Use ONLY the provided context to answer the question.
                    - Respond in the **same language** as the original query.
                    - Clearly cite the legal document, part, article, chapter, or schedule used in the answer.
                    - If there is not enough legal information to answer, return:
                    - `"message": ""`
                    - `"reference": []`
                    - `"category": []`
                    - Do **not hallucinate or make assumptions** outside the context.

                    ### Original User Query:
                    {user_query}

                    ### Translated English Query:
                    {translated_query}

                    ### Legal Context:
                    {top_chunks_texts}
                    """

            headers = {
                "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                }
            
            payload = {
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 2000
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
            print("Raw content from Groq response:")
            print(content_raw)
            try:
                
                content_dict = json.loads(content_raw)
                return content_dict
            except json.JSONDecodeError as e:
                 fPrompt = f""" my raw content is not in json format, please convert it to json format. \n\n {content_raw}
                my response should be in json format with the following keys:
                    {{
                    "message": "<Answer in the user's original language if context is sufficient, and in markdown format with titles for, immediate action, legal advice, next steps and other possible actions that can be taken (full detailed answer)>",
                    "reference": ["<Legal source reference like Constitution of Nepal, Part 3, Article 17>"],
                    "category": ["<Recommended type of lawyer or legal domain — e.g., constitutional lawyer, civil lawyer, criminal defense lawyer, family lawyer, etc.>"],
                    "type": "legal_query"
                    }}
                    """
                 fPayload = {
                    "model": MODEL,
                    "messages": [{"role": "user", "content": fPrompt}],
                    "temperature": 0.2,
                    "max_tokens": 2000
                    }
            
            async with httpx.AsyncClient() as client:
               response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers=headers,
                        json=fPayload,
                        timeout=15.0
                    )
               if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Groq API error")

                data = response.json()

            # Extract raw content string from the assistant message
            content_raw = data["choices"][0]["message"]["content"].strip()
            print("Raw content from Groq response:")
            print(content_raw)
            try:
                
                content_dict = json.loads(content_raw)
                return content_dict
            except json.JSONDecodeError as e:
                return content_raw

