// // import CameraView from "./components/CameraView";
// // import CameraCapture from "./components/CameraCapture";
// // import AlertSound from "./components/AlertSound";
// // import ScreenshotCard from "./components/ScreenshotCard.jsx";
// import HistoryPanel from "./components/HistoryPanel.jsx";

// // import DetectionCard from "./components/DetectionCard";
// import "./App.css";

// function App() {
//   return (
//     <div className="app">

//       <div className="hero">

//         <h1 className="title">
//           If Hands
//           Could Speak
//         </h1>

//         <p className="tagline">
//           Because sometimes asking for help
//           is silent.
//         </p>

//       </div>

//       <div className="camera-section">

//         <div className="camera-card">

//           <div className="camera-wrapper">

//             <HistoryPanel  />

//           </div>

//           <div className="status">

//             <div className="badge">
//               Scanning...
//             </div>

//             <div className="actions">

//               <button>
//                 Save
//               </button>

//               <button>
//                 Download
//               </button>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default App;

import { useState } from "react";
import HistoryDash from "./components/HistoryDash";
import HistoryPanel from "./components/HistoryPanel";
import InvisibleNetwork from "./components/InvisibleNetwork";
import "./App.css";

function App() {

const [tab,setTab] = useState("camera");

return (

<div className="app">

<header className="navbar">

<div className="center">

  <div className="title-row">

    <div>
    
        <h1 className="logo">Project Beacon</h1>

    </div>

    <div className="title-tag">
      <div>
      <h1 className="title">
        If Hands Could Speak
      </h1>
      </div>

      <div>
      <p className="tagline">
        Because sometimes asking for help is silent.
      </p>
      </div>

    </div>

    <div className="tabs">

      <button
        className={tab === "camera" ? "tab active" : "tab"}
        onClick={() => setTab("camera")}
      >
        Camera
      </button>

      <button
        className={tab === "gallery" ? "tab active" : "tab"}
        onClick={() => setTab("gallery")}
      >
        Gallery
      </button>

      <button
        className={tab === "network" ? "tab active" : "tab"}
        onClick={() => setTab("network")}
      >
        Networks
      </button>

    </div>

  </div>

</div>

</header>

<main className="content">

{
tab==="camera"

?

<div className="camera-center">

<HistoryPanel/>

</div>

:
tab==="gallery"
?
<HistoryDash/>

:
<InvisibleNetwork/>

}

</main>

</div>

);

}

export default App;