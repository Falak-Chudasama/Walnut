from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
import uuid

class ChromaStore:
    def __init__(self, db_path="./chromadb"):
        self.client = PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection("walnut-embeddings")
        self.embedder = SentenceTransformer("BAAI/bge-base-en-v1.5", trust_remote_code=True)

    def add_texts(self, texts: list[str], metadatas: list[dict] = None) -> list[str]:
        embeddings = self.embedder.encode(texts).tolist()
        ids = [str(uuid.uuid4()) for _ in texts]
        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas if metadatas else [{} for _ in texts]
        )
        return ids

    def search(self, query: str, k: int = 5):
        embedding = self.embedder.encode([query]).tolist()[0]
        return self.collection.query(query_embeddings=[embedding], n_results=k)