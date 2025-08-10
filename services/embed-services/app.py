from fastapi import FastAPI, HTTPException
from utils.schema_ import EmbedRequest, SearchRequest, DeleteRequest
import chromadb
from chromadb.config import Settings

app = FastAPI()

chroma_client = chromadb.Client(Settings())
collection = chroma_client.get_or_create_collection("context")

@app.get("/")
def index():
    return {"status": "ChromaDB context engine is live."}

@app.get("/get-all")
def get_all_documents():
    try:
        results = collection.get()
        documents = results.get("documents", [])
        metadatas = results.get("metadatas", [])
        ids = results.get("ids", [])

        formatted = [
            {"id": id_, "text": doc, "metadata": meta}
            for id_, doc, meta in zip(ids, documents, metadatas)
        ]

        return {"count": len(formatted), "data": formatted}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embed")
def embed_text(req: EmbedRequest):
    texts = req.content if isinstance(req.content, list) else [req.content]
    metadatas = (
        req.metadata if isinstance(req.metadata, list)
        else [req.metadata] * len(texts) if req.metadata else [{} for _ in texts]
    )
    current_count = collection.count()
    ids = [f"item-{i}" for i in range(current_count, current_count + len(texts))]
    collection.add(documents=texts, metadatas=metadatas, ids=ids)
    return {"message": f"{len(ids)} item(s) embedded successfully.", "ids": ids, "success": True}

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

@app.delete("/delete-all")
def delete_all_history():
    """Deletes and recreates the entire collection, clearing all data."""
    global collection
    try:
        chroma_client.delete_collection(name="context")
        collection = chroma_client.get_or_create_collection("context")
        return {"status": "success", "message": "Collection 'context' has been cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear collection: {str(e)}")

@app.delete("/delete-items")
def delete_items(req: DeleteRequest):
    """Deletes specific items from the collection by their IDs."""
    try:
        collection.delete(ids=req.ids)
        return {"status": "success", "message": f"Successfully deleted {len(req.ids)} item(s)."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))