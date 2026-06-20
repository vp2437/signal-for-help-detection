import os
import joblib
import numpy as np

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "gesture_classifier.pkl"
)

print("Loading:", MODEL_PATH)

model = joblib.load(
    MODEL_PATH
)


class HandRequest(
    BaseModel
):
    landmarks: list


@app.get("/")
def home():

    return {
        "status":
        "running"
    }


@app.post("/predict")
def predict(data: HandRequest):

    features = []

    for pt in data.landmarks:
        features.extend([
            pt["x"],
            pt["y"],
            pt["z"]
        ])

    if len(features) != 63:
        return {
            "gesture": "No Hand",
            "confidence": 0
        }

    arr = np.array(features).reshape(1, -1)

    prediction = model.predict(arr)[0]

    confidence = 0

    if hasattr(model, "predict_proba"):
        confidence = float(
            np.max(
                model.predict_proba(arr)
            )
        )

    # map labels
    LABELS = {
        0: "Normal",
        1: "Signal for Help",
        2: "Signal for Help"
    }

    try:
        prediction = int(prediction)
        gesture = LABELS.get(
            prediction,
            str(prediction)
        )
    except:
        gesture = str(prediction)

    return {
        "gesture": gesture,
        "confidence": confidence
    }