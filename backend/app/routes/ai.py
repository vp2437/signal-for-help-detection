from fastapi import APIRouter
from pydantic import BaseModel
import requests
import os

router = APIRouter()

HF_TOKEN = os.getenv("HF_TOKEN")

class EdgeRequest(BaseModel):
    source: str
    target: str

@router.post("/explain-edge")
async def explain_edge(req: EdgeRequest):

    url = "https://router.huggingface.co/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "Qwen/Qwen2.5-7B-Instruct",

        "messages": [
            {
                "role": "system",
                "content": (
                    "You explain relationships in simple terms. "
                    "Keep responses under 30 words. "
                    "Be factual and educational."
                )
            },
            {
                "role": "user",
                "content": f"Explain how {req.source} and {req.target} can be connected in a human trafficking network analysis context."
            }
        ],

        "max_tokens": 40,
        "temperature": 0.3,
        "stream": False
    }

    response = requests.post(url, headers=headers, json=payload)

    data = response.json()

    # debug safety
    print(data)

    explanation = "No response"

    if isinstance(data, dict):
        # OpenAI-style response
        if "choices" in data:
            explanation = data["choices"][0]["message"]["content"]

        # HF text-generation style
        elif "generated_text" in data:
            explanation = data["generated_text"]

        # HF error
        elif "error" in data:
            explanation = f"HF error: {data['error']}"

    elif isinstance(data, list) and len(data) > 0:
        item = data[0]

        if isinstance(item, dict) and "generated_text" in item:
            explanation = item["generated_text"]

        elif isinstance(item, str):
            explanation = item

    return {"explanation": explanation
            }