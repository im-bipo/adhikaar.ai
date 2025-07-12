from fastapi import FastAPI , Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from translator_and_classifier import translate_and_classify
from model import model



app = FastAPI()

@app.get("/query")
async def get_query(request:Request): 
    request_data = await request.json()
    user_query = request_data.get("user_query", "")
    classify = await translate_and_classify(user_query)
    if classify["category"] == "legal_query":
        response = await model(user_query, classify["response"])
        return response 


    else : 
        return  {
            "message": classify["response"], # response to the user query
            "reference": [], # reference to the legal document if any
            "category": [], # lawyer type / recommendation based on the query_subject
            "type": classify["category"]  # general_chat, unsupported, harmful_intent
        }
    
     
    