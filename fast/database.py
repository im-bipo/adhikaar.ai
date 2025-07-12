import os 
import httpx
import json 
from fastapi import HTTPException
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer, CrossEncoder


from pinecone import Pinecone , ServerlessSpec
load_dotenv()

# Load environment variables
API_KEY = os.getenv("API")
emdedding_model = os.getenv("embedding_model")
reranker_model = os.getenv("reranker_model")
database_index = os.getenv("database_API")
database_name = os.getenv("database_name")

# Connect to database
pc = Pinecone(api_key=database_index)
database = pc.Index(database_name)

# embedding-model 
embedder = SentenceTransformer(emdedding_model)

# # reranker-model
reranker = CrossEncoder(reranker_model)


def rerank_chunks(query:str, chunks:list)-> list:
     pairs = [(query, chunk['metadata']['text']) for chunk in chunks]
     scores = reranker.predict(pairs, convert_to_tensor=True)
     sorted_chunks = sorted(zip(chunks, scores), key=lambda x: x[1], reverse=True)
     return [chunk for chunk, score in sorted_chunks[:5]]



def top_k_chunks(query:str) -> list:
     embeded_query = embedder.encode(query, convert_to_tensor=True).tolist()
     # Query the database for top-k chunks  
     chunks = database.query(vector=embeded_query, top_k=10 , include_metadata=True)
     top_chunks = rerank_chunks(query, chunks['matches'])
     return top_chunks
   


