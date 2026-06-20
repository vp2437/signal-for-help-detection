// import CameraView from "./components/CameraView";
// import CameraCapture from "./components/CameraCapture";
// import AlertSound from "./components/AlertSound";
import ScreenshotCard from "./components/ScreenshotCard.jsx";

// import DetectionCard from "./components/DetectionCard";
import "./App.css";

function App() {
  return (
    <div className="app">

      <div className="hero">

        <h1 className="title">
          If Hands
          Could Speak
        </h1>

        <p className="tagline">
          Because sometimes asking for help
          is silent.
        </p>

      </div>

      <div className="camera-section">

        <div className="camera-card">

          <div className="camera-wrapper">

            <ScreenshotCard  />

          </div>

          <div className="status">

            <div className="badge">
              Scanning...
            </div>

            <div className="actions">

              <button>
                Save
              </button>

              <button>
                Download
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;