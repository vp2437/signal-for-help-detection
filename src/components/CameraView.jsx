import Webcam from "react-webcam";

function CameraView() {
      return (
           <div>
            <Webcam
                audio={false}
                screenshotFormat="image/png"
                width={700}
                mirrored={true}
            />
        </div>
      );
    }

export default CameraView;