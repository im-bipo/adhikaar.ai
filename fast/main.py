from fastapi import FastAPI
from pydantic import BaseModel
from translator_and_classifier import translate_and_classify

class Query(BaseModel):
    query: str


app = FastAPI()

@app.get("/query")
async def get_query(query: Query):
    user_query = query.query

