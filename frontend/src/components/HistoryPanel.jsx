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

export default function HistoryPanel() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarker = useRef(null);
  const rafRef = useRef(null);
  const processing = useRef(false);
  const mounted = useRef(true);

  const predictionRef = useRef({
    gesture: "No Signal",
    confidence: 0,
  });
  
  const alertTriggered = useRef(false);
  const audioRef = useRef(null);
  const [isAlert, setIsAlert] = useState(false);
  const soundActivated = useRef(false);
  const [showButton, setShowButton] = useState(true);

  // ── 1. Load MediaPipe once ─────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;

    (async () => {
      try {
        console.log("🔄 Loading Hand Landmarker...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        landmarker.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { 
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        
        console.log("✅ Hand Landmarker loaded successfully!");
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error("❌ Failed to load Hand Landmarker:", err);
      }
    })();

    return () => {
      mounted.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── 2. Beep function ──────────────────────────────────────────────────────
  const beep = async () => {
    if (!soundActivated.current || !audioRef.current) {
      console.log("🔇 BEEP BLOCKED - sound not activated");
      return;
    }
    
    try {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      await audio.play();
      console.log("🔊 BEEP PLAYED");
    } catch(err) {
      console.log("❌ BEEP FAILED", err);
    }
  };

  // ── 3. Capture Screenshot ──────────────────────────────────────────────
  const captureScreenshot = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;
    
    // only save alerts with high confidence
    if (predictionRef.current.confidence < 0.80) return;
    
    try {
      const snap = new Audio("/snap.mp3");
      await snap.play();
    } catch {}
    
    const canvas = document.createElement("canvas");
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    console.log(
      "Video:",
      video.videoWidth,
      video.videoHeight
    );

    console.log(
      "Canvas:",
      canvas.width,
      canvas.height
    );
    
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const image = canvas.toDataURL("image/jpeg", 0.9);
    
    await fetch("https://austinaihub-hackathon-june.onrender.com/upload-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        confidence: predictionRef.current.confidence
      })
    });
  };

  // ── 4. Main Loop ──────────────────────────────────────────────────────────
  const loop = async () => {
    console.log("LOOP");
    if (!mounted.current) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    // Wait until video is truly playing
    if (!video || video.readyState < 4 || !landmarker.current) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // Sync canvas size to video
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Detect hands
    const result = landmarker.current.detectForVideo(video, performance.now());
    console.log(result);

    // DEBUG: Log what's being detected
    if (result.landmarks && result.landmarks.length > 0) {
      console.log("🔍 Landmarks detected:", result.landmarks.length);
      console.log("Number of hands:", result.landmarks.length);
      console.log("Number of points:", result.landmarks[0].length);

      console.log("First point:", result.landmarks[0][0]);

      console.log("All points:", result.landmarks[0]);

      console.log(
        "Canvas:",
        canvas.width,
        canvas.height
);
    }

    // If no hands detected
    if (!result.landmarks || !result.landmarks.length) {
      setIsAlert(false);
      alertTriggered.current = false;
      
      // Still draw "No hands" message or just clear
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No hand detected", canvas.width/2, 50);
      
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // ── 5. Ask backend what gesture this is ──────────────────────────────
    let gesture = "Hand Detected";
    let confidence = 0;

    // if (!processing.current) {
    //   processing.current = true;
    //   try {
    //     // Format landmarks properly for the backend
    //     const landmarksFormatted = result.landmarks[0].map(pt => ({
    //       x: pt.x,
    //       y: pt.y,
    //       z: pt.z
    //     }));
        
    //     const handedness = result.handedness && result.handedness.length > 0 
    //       ? result.handedness[0][0].categoryName 
    //       : "Right";

    //     console.log("📤 Sending to backend:", {
    //       landmarks_count: landmarksFormatted.length,
    //       handedness: handedness
    //     });

    //     const res = await fetch("https://austinaihub-hackathon-june.onrender.com/predict", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         landmarks: landmarksFormatted,
    //         handedness: handedness
    //       }),
    //     });
        
    //     if (res.ok) {
    //       const data = await res.json();
    //       gesture = data.gesture ?? "No Signal";
    //       confidence = data.confidence ?? 0;
    //       predictionRef.current = {
    //         gesture,
    //         confidence,
    //       };
    //       console.log(`✅ ${gesture} · ${Math.round(confidence * 100)}%`);
    //     } else {
    //       console.error("❌ Backend error:", res.status, await res.text());
    //     }
    //   } catch (err) {
    //     console.error("❌ Backend fetch error:", err);
    //   }
    //   processing.current = false;
    // }
    
    console.log("Prediction:", predictionRef.current);
    console.log("Reached prediction");

    const currentGesture = String(predictionRef.current.gesture).toLowerCase();
    const alert = currentGesture.includes("help") && predictionRef.current.confidence >= 0.80;
    console.log("Alert value:", alert);

    if (alert !== isAlert) {
      setIsAlert(alert);
      console.log("Called setIsAlert");
    }

    console.log("BEFORE ALERT BLOCK");

    if (alert && !alertTriggered.current) {
      console.log("INSIDE ALERT BLOCK");
      console.log("🚨 ALERT TRIGGERED!");
      alertTriggered.current = true;
      await beep();
      setTimeout(() => {
        captureScreenshot();
      }, 300);
    }

    if (!alert) {
      alertTriggered.current = false;
    }

    const color = alert ? "red" : "lime";
    
    // ── 6. Draw every detected hand ────────────────────────────────────────
    // Apply mirroring for natural view
    // CLEAR ONCE AT START OF FRAME
ctx.clearRect(0, 0, canvas.width, canvas.height);

// SIMPLE TEST TEXT
ctx.fillStyle = "white";
ctx.font = "30px Arial";
ctx.fillText("HAND DETECTED", 20, 40);

// DRAW ONLY LANDMARK DOTS
result.landmarks.forEach((hand) => {
  hand.forEach((pt, index) => {
    const x = (1 - pt.x) * canvas.width;
    const y = pt.y * canvas.height;

    console.log(index, pt.x, pt.y, "=>", x, y);

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "lime";
    ctx.fill();

    // optional landmark index
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(index.toString(), x + 10, y);
  });
});

// DRAW CONNECTIONS
result.landmarks.forEach((hand) => {
  HAND_CONNECTIONS.forEach(([a, b]) => {
    const p1 = hand[a];
    const p2 = hand[b];

    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(
      (1 - p1.x) * canvas.width,
      p1.y * canvas.height
    );

    ctx.lineTo(
      (1 - p2.x) * canvas.width,
      p2.y * canvas.height
    );

    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.stroke();
  });
});

console.log("DRAWING LANDMARKS:", result.landmarks[0].length);

rafRef.current = requestAnimationFrame(loop);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
  style={{
    position: "relative",
    width: 640,
    height: 480,
    maxWidth: "100%",
  }}
>
      {showButton && (
        <button
          onClick={async () => {
            try {
              const audio = audioRef.current;
              if (!audio) return;
              await audio.play();
              audio.pause();
              audio.currentTime = 0;
              soundActivated.current = true;
              setShowButton(false);
              console.log("🔊 Sound unlocked");
            } catch(err) {
              console.log("❌ Enable failed", err);
            }
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            padding: "10px 16px",
          }}
        >
          Enable Sound
        </button>
      )}

<Webcam
  ref={webcamRef}
  mirrored
  audio={false}
  style={{
    width: "100%",
    display: "block",
    position: "relative",
    zIndex: 1,
  }}
/>

<canvas
  ref={canvasRef}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "transparent",
    zIndex: 9999,
  }}
/>

      <audio ref={audioRef} preload="auto" playsInline>
        <source src="/beep.mp3" type="audio/mpeg" />
      </audio>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          background: isAlert ? "#ef4444" : "rgba(0,0,0,0.55)",
        }}
      >
        {isAlert ? "🚨 ALERT" : "👀 Monitoring"}
      </div>
    </div>
  );
}