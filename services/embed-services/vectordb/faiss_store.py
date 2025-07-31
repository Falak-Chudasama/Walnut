# vectordb/faiss_store.py
import faiss
import os
import numpy as np
import json

class FaissStore:
    def __init__(self, dim, index_path="faiss.index", metadata_path="metadata.json"):
        self.dim = dim
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.texts = []

        self.load()

    def add(self, vectors: np.ndarray, metadata: list[str]):
        """Adds vectors and corresponding text metadata."""
        self.index.add(vectors)
        self.texts.extend(metadata)
        self.save()

    def save(self):
        """Saves the index and metadata to disk."""
        print("Saving FAISS index and metadata...")
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'w') as f:
            json.dump(self.texts, f)
        print("Save complete.")

    def load(self):
        """Loads the index and metadata from disk."""
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            print("Loading existing FAISS index and metadata...")
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, 'r') as f:
                self.texts = json.load(f)
            print(f"Loaded {self.index.ntotal} vectors and {len(self.texts)} text entries.")
        else:
            print("No existing index found. Initializing a new one.")
            self.index = faiss.IndexFlatL2(self.dim)

    def search(self, vector: np.ndarray, k=5) -> list[tuple[str, float]]:
        """Searches for the k nearest neighbors."""
        if self.index.ntotal == 0:
            return []

        distances, indices = self.index.search(np.array([vector]), k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1:
                results.append((self.texts[idx], float(distances[0][i])))
        return results