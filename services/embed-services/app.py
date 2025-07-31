# app.py
from fastapi import FastAPI
import numpy as np

from models.embedder import embedder_instance
from vectordb.faiss_store import FaissStore

from utils.schema import EmbedRequest, SearchRequest

app = FastAPI()

EMBEDDING_DIMENSION = embedder_instance.model.get_sentence_embedding_dimension()

faiss_store_instance = FaissStore(dim=EMBEDDING_DIMENSION)


@app.get("/")
def root():
    return {"status": "Embedding service is running"}

@app.post("/embed")
def embed_text(request: EmbedRequest):
    """
    Generates embeddings for a single text or a list of texts and stores them.
    """
    content_to_process = request.content
    
    vectors = embedder_instance.embed(content_to_process)
    
    metadata = content_to_process if isinstance(content_to_process, list) else [content_to_process]
    
    faiss_store_instance.add(vectors=vectors, metadata=metadata)
    
    return {"message": f"{len(metadata)} item(s) embedded and stored successfully."}

@app.post("/search")
def search_similar(request: SearchRequest):
    """Searches for texts similar to the query."""
    query_vector = embedder_instance.embed(request.query)[0]
    results = faiss_store_instance.search(query_vector, k=request.k)
    return {"results": results}
