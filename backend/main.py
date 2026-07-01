import os
import joblib
import numpy as np

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.routes.ai import router as ai_router


app = FastAPI()
app.include_router(ai_router)

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

print(model.classes_)
print(type(model.classes_[0]))


class HandRequest(
    BaseModel
):
    landmarks: list
    handedness: str


@app.get("/")
def home():

    return {
        "status":
        "running"
    }


@app.post("/predict")
def predict(data: HandRequest):

    features = []

    wrist = data.landmarks[0]
    is_left = data.handedness == "Left"
    middle = data.landmarks[9]

    scale = (
        (middle["x"] - wrist["x"]) ** 2 +
        (middle["y"] - wrist["y"]) ** 2 +
        (middle["z"] - wrist["z"]) ** 2
    ) ** 0.5

    scale = max(scale, 1e-6)

    for pt in data.landmarks:

        x = (pt["x"] - wrist["x"]) / scale
        y = (pt["y"] - wrist["y"]) / scale
        z = (pt["z"] - wrist["z"]) / scale

        if is_left:
            x = -x

        features.extend([x, y, z])


    if len(features) != 63:
        return {
            "gesture": "No Hand",
            "confidence": 0
        }

    arr = np.array(features).reshape(1, -1)

    # prediction = model.predict(arr)[0]
    probabilities = model.predict_proba(arr)[0]
    classes = model.classes_
    best_index = np.argmax(probabilities)

    prediction = classes[best_index]
    confidence = float(probabilities[best_index])
    print("Classes:", classes)
    print("Prediction:", prediction)
    print("Probabilities:", probabilities)

    if prediction == "Signal for Help" and confidence < 0.90:
        prediction = "No Signal"

    return {
        "gesture": prediction,
        "confidence": confidence
    }