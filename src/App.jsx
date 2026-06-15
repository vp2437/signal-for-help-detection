import CameraView from "./components/CameraView";

function App() {
    return (<div className="min-h-screen grid justify-center items-center bg-gray-900">
             <div>
              <h1 className="text-5xl font-bold text-white">
                Silent Signal
              </h1>
            </div>
             <div>
                 <CameraView />
             </div>
           </div>);
  }
  
export default App;