from pydantic import BaseModel
from typing import Union, List, Optional

class EmbedRequest(BaseModel):
    content: Union[str, List[str]]
    metadata: Optional[Union[dict, List[dict]]] = None

class SearchRequest(BaseModel):
    query: str
    k: int = 5

class DeleteRequest(BaseModel):
    ids: List[str]