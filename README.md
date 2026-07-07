# Signal for Help Detection System

An AI-powered platform designed to support human trafficking awareness, early intervention, and public education.

The system detects the internationally recognized Signal for Help gesture in real time and transforms a single distress signal into an entry point for understanding potential trafficking networks through AI-assisted visualization and analysis.

Built for the Austin AI Hub Hackathon.

---

## Features

- Real-time hand tracking using MediaPipe Hand Landmarker
- AI-powered detection of the internationally recognised Signal for Help gesture
- Left and right hand support through landmark normalization
- Confidence thresholding and multi-frame confirmation to reduce false positives
- Real-time visual feedback with dynamic gesture overlays
- Audio alert when a gesture is confirmed
- Automatic screenshot capture with Cloudinary image storage
- Detection history dashboard backed by Supabase
- Interactive trafficking network exploration using React Flow
- Progressive node expansion revealing increasingly complex trafficking structures
- AI-generated relationship explanations powered by a Hugging Face language model
- Responsive React frontend with FastAPI backend

---

## Project Goal

Victims of human trafficking and abuse often cannot safely ask for help, while the networks behind exploitation remain largely hidden from public view.

This project combines computer vision, machine learning, and AI-assisted visualization to address both challenges. It detects the internationally recognised Signal for Help gesture in real time and transforms each confirmed detection into an interactive exploration of possible trafficking networks.

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
- Pandas
- Joblib
- Uvicorn

### AI Model
- MediaPipe Hand Landmarker
- Random Forest Classifier
- Landmark normalization
- Confidence thresholding

### Data and Visualization

- React Flow for interactive graph visualization
- Hugging Face Inference API for AI-generated relationship explanations
- Cloud database for detection history 

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

Create a `.env` file inside the `backend` directory containing your Hugging Face API token.

```env
HF_TOKEN=your_huggingface_api_key
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

### Frontend

The frontend is deployed using **Vercel**, serving the React + Vite application.

### Backend

The FastAPI backend is deployed on **Render**, exposing REST API endpoints for gesture prediction, screenshot uploads, history retrieval, and AI-generated network explanations.

### Database & Storage

- **Supabase** stores detection history, timestamps, confidence scores, and image URLs.
- **Cloudinary** stores captured alert screenshots and serves them through secure cloud-hosted URLs.

---

## How It Works

1. The webcam captures video frames.
2. MediaPipe detects hand landmarks.
3. Landmarks are normalized into feature vectors.
4. The backend predicts whether the gesture is the Signal for Help.
5. Confidence thresholding and multi-frame validation reduce false positives before confirming a gesture.
6. When confirmed, the system triggers an audio alert, captures a screenshot, and stores the event in the database.
7. Each detection becomes a logged event accessible in the history dashboard.
8. The same event can initiate an AI-assisted exploration of related trafficking networks, generating and expanding connections between relevant actors to support understanding of possible exploitation structures.

---

## Model Training

The machine learning pipeline consists of:

1. Collecting a publicly available Signal for Help dataset.
2. Expanding the dataset with over **600 custom No Signal gesture images** covering common hand poses such as thumbs-up, pointing, and other variations.
3. Extracting 21 hand landmarks from each image using the MediaPipe Hand Landmarker.
4. Normalizing landmarks relative to the wrist and hand scale to improve invariance across different hand sizes and orientations.
5. Training a Random Forest classifier using Scikit-learn.
6. Performing hyperparameter optimisation with GridSearchCV and evaluating performance using 5-fold cross-validation.
7. Saving the trained model for inference within the FastAPI backend.

---

## Invisible Connections: AI-Assisted Network Visualization

Human trafficking is often hidden behind fragmented and disconnected observations. A single signal can represent only one part of a much larger system involving recruiters, transporters, brokers, employers, and other enabling actors.

This visualization module transforms a detected Signal for Help event into an interactive exploration of these hidden structures. Users can expand and navigate a network graph that models possible relationships between actors, with AI generated explanations helping interpret how and why connections may exist.

Rather than presenting isolated data points, the system reframes each detection as a starting point for understanding broader trafficking ecosystems, supporting awareness through visual analysis and contextual storytelling.

---

## Dataset

The machine learning model was trained using the **SFH Dataset**, a publicly available dataset containing images of the **Signal for Help** gesture and **No Signal** hand poses.

To improve robustness and reduce false positives, the dataset was expanded with **over 600 additional custom No Signal images** featuring diverse hand poses including thumbs-up, pointing, crossed fingers, and other gestures commonly mistaken for the Signal for Help.

Each image is processed using the MediaPipe Hand Landmarker to extract 21 hand landmarks, which are normalized and used as feature vectors for training the Random Forest classifier.

**Dataset:** [SFH Dataset on Kaggle](https://www.kaggle.com/datasets/umairshafique/sfh-dataset)

---

## Model Performance

The final Random Forest classifier achieved:

- **96.35% Test Accuracy**
- **96.21% Cross-Validation Accuracy**
- **97% Precision** for Signal for Help detection
- Confidence thresholding and multi-frame validation further reduced false positives during real-time inference.

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
- Further improve robustness against visually similar gestures using larger and more diverse datasets
- Add temporal deep learning models for gesture recognition
- Expand mobile support
- Multiple hand detection
- Explore integration with CCTV and public camera systems for real time detection in monitored environments where privacy and consent frameworks are defined  

---

## Motivation

The Signal for Help gesture was created as a discreet way for individuals experiencing abuse or coercion to request assistance safely.

While recognising the gesture is important, understanding the wider context in which it may occur is equally valuable for education and awareness.

This project combines real time AI gesture recognition with interactive network visualization to improve awareness of trafficking systems, support early understanding, and make hidden patterns of exploitation more visible.