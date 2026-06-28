from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter()

class EdgeRequest(BaseModel):
    source: str
    target: str

@router.post("/explain-edge")
async def explain_edge(req: EdgeRequest):

    prompt = f"""
Explain how "{req.source}" and "{req.target}"
can be related within a human trafficking network.

Keep the explanation educational,
factual and under 30 words.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    return {
        "explanation": data["response"]
    }