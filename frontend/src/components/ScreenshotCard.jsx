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

export default function ScreenshotCard() {
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
  
  const alertTriggered =
  useRef(false);
  
  const audioRef =
  useRef(null);

  const [isAlert, setIsAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // ── 1. Load MediaPipe once ─────────────────────────────────────────────────
  useEffect(() => {
    mounted.current = true;

    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
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
  const beep = async () => {

    if (
      !audioRef.current ||
      !soundEnabled
    )
    return;
  
    try {
  
      audioRef.current.pause();
  
      audioRef.current.currentTime = 0;
  
      await audioRef.current.play();
  
      console.log("BEEP PLAYED");
  
    }
  
    catch (err) {
  
      console.log(
        "BEEP FAILED",
        err
      );
  
    }
  
  };

  const captureScreenshot = () => {

    const video =
    webcamRef.current?.video;
    
    if (!video)
    return;
    
    const canvas =
    document.createElement("canvas");
    
    canvas.width =
    video.videoWidth;
    
    canvas.height =
    video.videoHeight;
    
    const ctx =
    canvas.getContext("2d");
    
    ctx.drawImage(
    video,
    0,
    0
    );
    
    const image =
    canvas.toDataURL(
    "image/png"
    );
    
    const link =
    document.createElement("a");
    
    link.href =
    image;
    
    link.download =
    `alert-${Date.now()}.png`;
    
    link.click();
    
    };

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

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        const res = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send first detected hand
          body: JSON.stringify({ landmarks: result.landmarks[0] }),
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

    const currentGesture =
String(
predictionRef.current.gesture
)
.toLowerCase();

const alert =
    currentGesture.includes(
    "help"
    )

    &&

    predictionRef.current
    .confidence

    >=

    0.80;

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
        
        if (
            alert &&
            !alertTriggered.current
            ) {
            
            console.log(
            "BEEP"
            );
            
            alertTriggered.current =
            true;
            
            beep();

            captureScreenshot();
            
            }
        
        if (
        !alert
        ) {
        
        alertTriggered.current =
        false;
        
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

<button
  onClick={async () => {

    if (!audioRef.current)
    return;

    if (!soundEnabled) {

      try {

        await audioRef.current.play();

        setTimeout(() => {

          audioRef.current.pause();

          audioRef.current.currentTime = 0;

        }, 200);

        setSoundEnabled(true);

        console.log(
          "Sound enabled"
        );

      }

      catch (err) {

        console.log(
          "Enable failed",
          err
        );

      }

    }

    else {

      audioRef.current.pause();

      audioRef.current.currentTime = 0;

      setSoundEnabled(false);

      console.log(
        "Sound disabled"
      );

    }

  }}

  style={{
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  }}
>

{
soundEnabled
? "Disable Sound"
: "Enable Sound"
}

</button>

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

    <audio
      ref={audioRef}
      preload="auto"
    >
      <source src="/beep.mp3" type="audio/mpeg" />
    </audio>

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
