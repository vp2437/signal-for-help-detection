# Signal for Help Detection System

An AI-powered platform designed to support human trafficking awareness, early intervention, and public education.

The system detects the internationally recognized Signal for Help gesture in real time and transforms a single distress signal into an entry point for understanding potential trafficking networks through AI-assisted visualization and analysis.

Built for the Austin AI Hub Hackathon.

---

## Features

- Real-time hand tracking with MediaPipe  
- AI-powered detection of the Signal for Help gesture used in human trafficking contexts  
- Visual alert overlay  
- Audio alert when the gesture is detected  
- Automatic screenshot capture and storage in a database  
- Detection history dashboard backed by database storage  
- Left and right hand support  
- Confidence filtering to reduce false positives  
- Multi-frame confirmation to improve detection reliability  
- Interactive network exploration using React Flow  
- Multi-stage visualization revealing increasingly complex trafficking structures  
- Dynamic node and edge expansion to expose hidden connections  
- AI-generated explanations for relationships between network actors  
- Real-time relationship analysis powered by a Hugging Face language model  

---

## Project Goal

Human trafficking remains difficult to detect because victims often cannot safely ask for help and the structures behind exploitation are rarely visible to the public.

This project addresses both challenges by combining real time gesture detection with an AI driven system that transforms a single Signal for Help event into an exploratory view of possible trafficking ecosystems.

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

### Data and Visualization
- React Flow for interactive graph visualization of human trafficking networks  
- AI-generated explanations of relationships between entities in trafficking systems  
- LLM-based analysis of connections between actors such as recruiters, transporters, and exploiters  

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
2. MediaPipe detects hand landmarks.
3. Landmarks are normalized into feature vectors.
4. The backend predicts whether the gesture is the Signal for Help.
5. A confidence threshold and temporal validation ensure stable detection across multiple frames.
6. When confirmed, the system triggers an audio alert, captures a screenshot, and stores the event in the database.
7. Each detection becomes a logged event accessible in the history dashboard.
8. The same event can initiate an AI-assisted exploration of related trafficking networks, generating and expanding connections between relevant actors to support understanding of possible exploitation structures.

---

## Model Training

The training pipeline consists of:

1. Collecting a publicly available dataset of Signal for Help and non-signal hand poses.
2. Extracting 21 hand landmarks using MediaPipe.
3. Normalizing landmarks into feature vectors.
4. Training a Random Forest classifier with Scikit-learn.
5. Saving the trained model for inference in the FastAPI backend.

---

## Invisible Connections: AI-Assisted Network Visualization

Human trafficking is often hidden behind fragmented and disconnected observations. A single signal can represent only one part of a much larger system involving recruiters, transporters, brokers, employers, and other enabling actors.

This visualization module transforms a detected Signal for Help event into an interactive exploration of these hidden structures. Users can expand and navigate a network graph that models possible relationships between actors, with AI generated explanations helping interpret how and why connections may exist.

Rather than presenting isolated data points, the system reframes each detection as a starting point for understanding broader trafficking ecosystems, supporting awareness through visual analysis and contextual storytelling.

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
- Reduce false positives futher
- Add temporal deep learning models for gesture recognition
- Expand mobile support
- Multiple hand detection
- Explore integration with CCTV and public camera systems for real time detection in monitored environments where privacy and consent frameworks are defined  

---

## Motivation

The Signal for Help gesture was created as a discreet way for individuals experiencing abuse or coercion to request assistance safely.

While detecting the gesture is important, understanding what it may represent in context is equally critical.

This project combines real time AI gesture recognition with interactive network visualization to improve awareness of trafficking systems, support early understanding, and make hidden patterns of exploitation more visible.