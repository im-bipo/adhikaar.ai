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
        return  {
            "message": classify["response"],
            "reference": ["Article-", "Part-", "Chapter-", "Schedule-"],
            "category": ["law"],
            "type": classify["category"]
        }
    # else : 
    #    translated_query = classify["response"]
    #    response = await model(user_query , translated_query)
    # return {
    #     "answer" : response["answer"]
    # }
    
    else : 
        return  {
            "message": classify["response"],
            "reference": [],
            "category": [],
            "type": classify["category"]
        }
     
    