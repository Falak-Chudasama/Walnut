from fastapi import FastAPI, HTTPException
from utils.schema_ import EmbedRequest, SearchRequest
import chromadb
from chromadb.config import Settings

app = FastAPI()

chroma_client = chromadb.Client(Settings())
collection = chroma_client.get_or_create_collection("context")

@app.get("/")
def index():
    return {"status": "ChromaDB context engine is live."}

@app.post("/embed")
def embed_text(req: EmbedRequest):
    texts = req.content if isinstance(req.content, list) else [req.content]
    metadatas = (
        req.metadata if isinstance(req.metadata, list)
        else [req.metadata] * len(texts)
        if req.metadata else [{} for _ in texts]
    )
    ids = [f"item-{i}" for i in range(collection.count(), collection.count() + len(texts))]
    collection.add(documents=texts, metadatas=metadatas, ids=ids)
    return {"message": f"{len(ids)} item(s) embedded successfully.", "ids": ids}

@app.post("/search")
def search_text(req: SearchRequest):
    try:
        results = collection.query(query_texts=[req.query], n_results=req.k)
        documents = results["documents"][0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        return {
            "results": [
                {"text": doc, "metadata": meta, "distance": dist}
                for doc, meta, dist in zip(documents, metadatas, distances)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))