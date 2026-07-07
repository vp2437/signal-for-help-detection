import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

export default function DetectionCard() {
  const webcamRef   = useRef(null);
  const canvasRef   = useRef(null);
  const landmarker  = useRef(null);
  const rafRef      = useRef(null);
  const processing  = useRef(false);
  const mounted     = useRef(true);

  const predictionRef = useRef({
    gesture: "No Signal",
    confidence: 0,
  });

  const alertFrames = useRef(0);
  const [isAlert, setIsAlert] = useState(false);

  // ── 1. Load MediaPipe once ─────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;

    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );
      landmarker.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/hand_landmarker.task" },
        runningMode: "VIDEO",
        numHands: 1,
      });
      // Start loop only after model is ready
      rafRef.current = requestAnimationFrame(loop);
    })();

    return () => {
      mounted.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── 2. Detection loop ──────────────────────────────────────────────────────
  const loop = async () => {
    if (!mounted.current) return;

    const video  = webcamRef.current?.video;
    const canvas = canvasRef.current;

    // Wait until video is truly playing
    if (!video || video.readyState < 4 || !landmarker.current) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // Sync canvas size to video
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log(
      video.videoWidth,
      video.videoHeight,
      canvas.width,
      canvas.height
    );

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100, 100);

    const result = landmarker.current.detectForVideo(video, performance.now());

    if (!result.landmarks.length) {
        setIsAlert(false);
      
        rafRef.current =
          requestAnimationFrame(loop);
      
        return;
      }

    // ── 3. Ask backend what gesture this is ────────────────────────────────
    let gesture    = "Hand Detected";
    let confidence = 0;

    if (!processing.current) {
      processing.current = true;
      try {
        const res = await fetch("https://austinaihub-hackathon-june.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send first detected hand
          body: JSON.stringify({ landmarks: result.landmarks[0],
                handedness: result.handedness[0][0].categoryName,
           }),
        });
        if (res.ok) {
            const data = await res.json();
          
            gesture =
            data.gesture ??
            "No Signal";

            confidence =
            data.confidence ??
            0;

            predictionRef.current = {
            gesture,
            confidence,
            };
          
            console.log(
              `${gesture} · ${Math.round(confidence * 100)}%`
            );
          }
      } catch {
        // Backend offline — still show green skeleton
      }
      processing.current = false;
    }

//     const currentGesture =
// String(
// predictionRef.current.gesture
// )
// .toLowerCase();

// const alert =
//     currentGesture.includes(
//     "help"
//     )

//     &&

//     predictionRef.current
//     .confidence

//     >=

//     0.95;

    const currentGesture =
        String(predictionRef.current.gesture).toLowerCase();

    const detected =
        currentGesture.includes("help") &&
        predictionRef.current.confidence >= 0.90;

    if (detected) {
        alertFrames.current++;
    } else {
        alertFrames.current = 0;
    }

    const alert = alertFrames.current >= 8;

    console.log(
    "ALERT:",
    alert,
    "| Gesture:",
    predictionRef.current.gesture,
    "| Confidence:",
    predictionRef.current.confidence
    );

        if (
        alert !== isAlert
        ) {
        setIsAlert(alert);
        }

    const color =
        alert
        ? "red"
        : "lime";

    // ── 4. Draw every detected hand ────────────────────────────────────────
    result.landmarks.forEach((hand) => {
      // connections
      HAND_CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        // Mirror x because Webcam is mirrored and canvas transform: scaleX(-1)
        ctx.moveTo(
            hand[a].x * canvas.width,
            hand[a].y * canvas.height
          );
          
          ctx.lineTo(
            hand[b].x * canvas.width,
            hand[b].y * canvas.height
          );
        ctx.strokeStyle = color;
        ctx.lineWidth   = 5;
        ctx.stroke();
      });

      // joints
      hand.forEach((pt) => {

        ctx.beginPath();
        
        ctx.arc(
        pt.x *
        canvas.width,
        
        pt.y *
        canvas.height,
        
        6,
        
        0,
        
        Math.PI * 2
        );
        
        ctx.fillStyle =
        color;
        
        ctx.fill();
        
        });
    });

    rafRef.current = requestAnimationFrame(loop);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: 640, maxWidth: "100%" }}>
      {/* Webcam — mirrored so it looks natural */}
      <Webcam
        ref={webcamRef}
        mirrored
        audio={false}
        style={{ width: "100%", display: "block" }}
        videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
      />

      {/* Canvas overlay — NO css transform needed; we mirror coords manually */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Status badge */}
      <div
        style={{
          position: "absolute",
          bottom: 12, left: 12,
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          background: isAlert ? "#ef4444" : "rgba(0,0,0,0.55)",
        }}
      >
        {isAlert
        ? "ALERT"
        : "Monitoring"}
      </div>
    </div>
  );
}
