import base64
import cloudinary
import cloudinary.uploader

from fastapi import APIRouter
from pydantic import BaseModel

from supabase import create_client
from os import getenv

router = APIRouter()

cloudinary.config(
    cloud_name=getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=getenv("CLOUDINARY_API_KEY"),
    api_secret=getenv("CLOUDINARY_API_SECRET")
)

supabase = create_client(
    getenv("SUPABASE_URL"),
    getenv("SUPABASE_KEY")
)

class UploadRequest(BaseModel):
    image: str
    confidence: float


@router.post("/upload-alert")
def upload_alert(data: UploadRequest):

    result = cloudinary.uploader.upload(
        data.image,
        folder="signal-help"
    )

    image_url = result["secure_url"]

    supabase.table(
        "alerts"
    ).insert({
        "image_url": image_url,
        "confidence": data.confidence
    }).execute()

    return {
        "success": True,
        "url": image_url
    }
    
@router.get("/alerts")
def get_alerts():

    data = (
        supabase
        .table("alerts")
        .select("*")
        .order(
            "created_at",
            desc=True
        )
        .execute()
    )

    return data.data