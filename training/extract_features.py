import cv2
import pandas as pd
import os
import math
import mediapipe as mp

from mediapipe.tasks.python import vision
from mediapipe.tasks.python import BaseOptions


model_path = "../frontend/public/hand_landmarker.task"

detector = vision.HandLandmarker.create_from_options(
    vision.HandLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=model_path
        ),
        num_hands=1
    )
)

rows=[]

DATASET="dataset"

for label in os.listdir(DATASET):

    folder = os.path.join(DATASET, label)

    # Skip hidden files and anything that isn't a folder
    if not os.path.isdir(folder):
        continue

    for file in os.listdir(folder):

        path=os.path.join(
            folder,
            file
        )

        image=cv2.imread(path)

        if image is None:
            continue

        rgb = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb
        )

        result=detector.detect(
            mp_image
        )

        if result.hand_landmarks:

            hand=result.hand_landmarks[0]

            features=[]

            wrist = hand[0]
            middle = hand[9]

            scale = math.sqrt(
                (middle.x - wrist.x) ** 2 +
                (middle.y - wrist.y) ** 2 +
                (middle.z - wrist.z) ** 2
            )

            scale = max(scale, 1e-6)

            for p in hand:

                features.extend([
                    (p.x - wrist.x) / scale,
                    (p.y - wrist.y) / scale,
                    (p.z - wrist.z) / scale,
                ])

            features.append(
                label
            )

            rows.append(
                features
            )

df=pd.DataFrame(
rows
)

df.to_csv(
"features.csv",
index=False
)

print(
f"saved {len(rows)}"
)