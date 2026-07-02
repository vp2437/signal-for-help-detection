# Signal for Help Detection System

An AI-powered web application that detects the internationally recognized Signal for Help hand gesture in real time using a webcam. The system combines MediaPipe hand tracking, a Random Forest machine learning model, and a FastAPI backend to provide live gesture recognition with visual and audio alerts.

Built for the Austin AI Hub Hackathon.

---

## Features

- Real-time hand tracking with MediaPipe
- AI-powered Signal for Help detection
- Visual alert overlay
- Audio alert when the gesture is detected
- Automatic screenshot capture
- Detection history dashboard
- Left and right hand support
- Confidence filtering to reduce false positives

---

## Tech Stack

### Frontend

- React
- Vite
- MediaPipe Tasks Vision
- HTML5 Canvas

### Backend

- FastAPI
- Scikit-learn
- NumPy
- Joblib

### AI Model

- MediaPipe Hand Landmarker
- Random Forest Classifier
- Landmark normalization
- Confidence thresholding

---

## Project Structure

```
austinaihub-hackathon-june/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── main.py
│   └── ...
│
├── training/
│   ├── dataset/
│   ├── extract_features.py
│   ├── train.py
│   └── features.csv
│
├── models/
│   └── gesture_classifier.pkl
│
├── requirements.txt
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/vp2437/austinaihub-hackathon-june.git
cd austinaihub-hackathon-june
```

---

## Backend Setup

Create a virtual environment.

```bash
python -m venv .venv
```

Activate it.

### Windows

```bash
.venv\Scripts\activate
```

### macOS/Linux

```bash
source .venv/bin/activate
```

Install the dependencies.

```bash
pip install -r requirements.txt
```

Start the backend.

```bash
cd backend
uvicorn main:app --reload
```

The backend runs at

```
http://localhost:8000
```

---

## Frontend Setup

Open a second terminal.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at

```
http://localhost:5173
```

---

## Deployment

### Backend

Hosted on Render.

### Frontend

Built with React and Vite.

---

## How It Works

1. The webcam captures video frames.
2. MediaPipe detects the hand landmarks.
3. The landmarks are normalized.
4. The backend predicts whether the gesture is the Signal for Help.
5. Predictions must exceed a confidence threshold across multiple consecutive frames before an alert is triggered.
6. When an alert is confirmed, the application plays an audio alarm and automatically captures a screenshot.

---

## Model Training

The training pipeline consists of:

1. Using a publicly available hand gesture dataset.
2. Extracting normalized hand landmarks using MediaPipe.
3. Converting landmarks into feature vectors.
4. Training a Random Forest classifier with Scikit-learn.
5. Saving the trained model using Joblib for inference in the FastAPI backend.

---

## Invisible Connections: AI-Assisted Network Visualization

Human trafficking often appears as isolated incidents, but behind every case exists a larger network of recruiters, brokers, transporters, employers, and enabling structures.

Our **Invisible Connections** visualization helps users explore these hidden relationships through an interactive network graph. Starting from a single distress signal, users progressively uncover the deeper layers of actors and systems involved in trafficking operations.

### Features

- Interactive network exploration using **React Flow**
- Multi-stage visualization revealing increasingly complex trafficking structures
- Dynamic node and edge expansion to expose hidden connections
- AI-generated explanations for relationships between network actors
- Real-time relationship analysis powered by an LLM (Ollama)

### Technologies Used

- React
- React Flow
- FastAPI
- Python
- Ollama

### Impact

This visualization transforms abstract trafficking networks into an interactive experience that is easier to understand and explore. By combining network visualization with AI-generated interpretation, it helps make invisible systems visible, supporting trafficking awareness through education, storytelling, and engagement.

---

## Dataset

The machine learning model was trained using the **SFH Dataset**, a publicly available dataset containing images of the **Signal for Help** gesture and **No Signal** hand poses.

During training, each image is processed using the MediaPipe Hand Landmarker to extract 21 hand landmarks. These landmarks are normalized and used as input features for the Random Forest classifier.

**Dataset:** [SFH Dataset on Kaggle](https://www.kaggle.com/datasets/umairshafique/sfh-dataset)

---

## Screenshots

### Monitoring Mode

![Monitoring](images/monitoring.png)

### Signal Detected

![Alert](images/alert.png)

### History Dashboard

![History](images/history.png)

---

## Future Improvements

- Improve feature engineering using joint angles and finger distances
- Reduce false positives
- Temporal gesture recognition
- Mobile support
- Multiple hand detection

---

## Motivation

This project explores the use of computer vision and machine learning for real-time gesture recognition. By combining MediaPipe hand tracking with a Random Forest classifier, the system aims to detect the Signal for Help gesture quickly and accurately through a standard webcam.