// // import CameraView from "./components/CameraView";
// import CameraCapture from "./components/CameraCapture";

// function App() {
//     return (<div className="min-h-screen grid justify-center items-center bg-gray-900">
//              <div>
//               <h1 className="text-5xl font-bold text-white">
//                 Silent Signal
//               </h1>
//             </div>
//              <div>
//                  {/* <CameraView /> */}
//                  <CameraCapture />
//              </div>
//            </div>);
//   }
  
// export default App;

// import CameraCapture from "./components/CameraCapture";
import DetectionCard from "./components/DetectionCard";
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

            <DetectionCard  />

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