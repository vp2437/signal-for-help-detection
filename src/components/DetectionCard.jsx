import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

function CameraCapture() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarker = useRef(null);

  useEffect(() => {
    const setup = async () => {

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      handLandmarker.current = await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: "/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 2,
        }
      );

      detect();
    };

    setup();
  }, []);

  const detect = () => {

    const video = webcamRef.current?.video;

    if (
      video &&
      video.readyState === 4 &&
      handLandmarker.current
    ) {

      const result = handLandmarker.current.detectForVideo(
        video,
        performance.now()
      );

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      result.landmarks.forEach((hand) => {

        HAND_CONNECTIONS.forEach(([a, b]) => {

          ctx.beginPath();

          ctx.moveTo(
            hand[a].x * canvas.width,
            hand[a].y * canvas.height
          );

          ctx.lineTo(
            hand[b].x * canvas.width,
            hand[b].y * canvas.height
          );

          ctx.strokeStyle = "lime";
          ctx.lineWidth = 3;
          ctx.stroke();

        });

        hand.forEach((point) => {

          ctx.beginPath();

          ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            5,
            0,
            Math.PI * 2
          );

          ctx.fillStyle = "red";
          ctx.fill();

        });

      });

    }

    requestAnimationFrame(detect);
  };

  return (
    <div style={{ position: "relative", width: 640 }}>
      <Webcam
        ref={webcamRef}
        mirrored
        audio={false}
        style={{ width: "100%" }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default CameraCapture;