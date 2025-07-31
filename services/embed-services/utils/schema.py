# utils/schema.py
from pydantic import BaseModel
from typing import Union, List

class EmbedRequest(BaseModel):
    """
    Defines the request body for the /embed endpoint.
    It can accept either a single string or a list of strings.
    """
    content: Union[str, List[str]]

class SearchRequest(BaseModel):
    query: str
    k: int = 3