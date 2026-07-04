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
  const containerRef = useRef(null);

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
    
    if (predictionRef.current.confidence < 0.80) return;
    
    try {
      const snap = new Audio("/snap.mp3");
      await snap.play();
    } catch {}
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
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
    if (!mounted.current) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (!video || video.readyState < 4 || !landmarker.current) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // CRITICAL FIX: Set canvas size to match video EXACTLY
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    // Only update if size changed
    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      console.log("📐 Canvas resized to:", canvas.width, "x", canvas.height);
    }

    // Clear canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Detect hands
    const result = landmarker.current.detectForVideo(video, performance.now());

    // If no hands detected
    if (!result.landmarks || !result.landmarks.length) {
      setIsAlert(false);
      alertTriggered.current = false;
      
      // Show "No hand detected" message
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✋ No hand detected", canvas.width / 2, canvas.height / 2);
      
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // ── 5. Ask backend what gesture this is ──────────────────────────────
    if (!processing.current) {
      processing.current = true;
      try {
        const landmarksFormatted = result.landmarks[0].map(pt => ({
          x: pt.x,
          y: pt.y,
          z: pt.z
        }));
        
        const handedness = result.handedness && result.handedness.length > 0 
          ? result.handedness[0][0].categoryName 
          : "Right";

        const res = await fetch("https://austinaihub-hackathon-june.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            landmarks: landmarksFormatted,
            handedness: handedness
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          predictionRef.current = {
            gesture: data.gesture ?? "No Signal",
            confidence: data.confidence ?? 0,
          };
          console.log(`✅ ${predictionRef.current.gesture} · ${Math.round(predictionRef.current.confidence * 100)}%`);
        }
      } catch (err) {
        console.error("❌ Backend error:", err);
      }
      processing.current = false;
    }

    const currentGesture = String(predictionRef.current.gesture).toLowerCase();
    const alert = currentGesture.includes("help") && predictionRef.current.confidence >= 0.80;

    if (alert !== isAlert) {
      setIsAlert(alert);
    }

    if (alert && !alertTriggered.current) {
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

    const color = alert ? "#FF0000" : "#00FF00";
    
    // ── 6. Draw every detected hand ────────────────────────────────────────
    // Apply mirroring for natural view
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    result.landmarks.forEach((hand) => {
      // Draw connections
      ctx.beginPath();
      HAND_CONNECTIONS.forEach(([a, b]) => {
        const x1 = hand[a].x * canvas.width;
        const y1 = hand[a].y * canvas.height;
        const x2 = hand[b].x * canvas.width;
        const y2 = hand[b].y * canvas.height;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw points
      hand.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(
          pt.x * canvas.width,
          pt.y * canvas.height,
          8,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();
        // Add white border for visibility
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    ctx.restore();

    // Draw status text on canvas (not mirrored)
    ctx.fillStyle = color;
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 10;
    ctx.fillText(`👋 ${predictionRef.current.gesture}`, 10, 10);
    ctx.fillText(`📊 ${Math.round(predictionRef.current.confidence * 100)}%`, 10, 35);
    ctx.shadowBlur = 0;

    // Continue the loop
    rafRef.current = requestAnimationFrame(loop);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div 
      ref={containerRef}
      style={{ 
        position: "relative", 
        width: "100%", 
        maxWidth: "640px",
        margin: "0 auto",
        aspectRatio: "4/3",
        backgroundColor: "#000",
        overflow: "hidden",
        borderRadius: "12px",
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
            top: "10px",
            right: "10px",
            zIndex: 20,
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          🔊 Enable Sound
        </button>
      )}

      {/* Webcam - fill container */}
      <Webcam
        ref={webcamRef}
        mirrored
        audio={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        videoConstraints={{ 
          width: 640, 
          height: 480, 
          facingMode: "user" 
        }}
      />

      {/* Canvas overlay - exact same size as container */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
          display: "block",
        }}
      />

      <audio ref={audioRef} preload="auto" playsInline>
        <source src="/beep.mp3" type="audio/mpeg" />
      </audio>

      {/* Status badge */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          padding: "6px 16px",
          borderRadius: "999px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#fff",
          background: isAlert ? "#ef4444" : "rgba(0,0,0,0.7)",
          zIndex: 15,
          backdropFilter: "blur(4px)",
          border: isAlert ? "2px solid #ef4444" : "none",
        }}
      >
        {isAlert ? "🚨 ALERT" : "👀 Monitoring"}
      </div>
    </div>
  );
}