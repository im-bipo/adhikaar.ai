from fastapi import FastAPI, Query
from translator_and_classifier import translate_and_classify
from model import model  # Assuming this is your RAG model

app = FastAPI()

@app.get("/query")
async def get_query(user_query: str = Query(...)):
    # Call the classifier
    classify = await translate_and_classify(user_query)

    # If it's a legal query, respond with references and type
    if classify["category"] == "legal_query":
        return {
            "message": classify["response"],
            "reference": ["Article-", "Part-", "Chapter-", "Schedule-"],
            "category": ["law"],
            "type": classify["category"]
        }
    
    # Otherwise, general or non-legal response
    else:
        return {
            "message": classify["response"],
            "reference": [],
            "category": [],
            "type": classify["category"]
        }


@app.get("/health")
async def health_check():
    return {"status": "ok"}
