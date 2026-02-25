import { useState, useEffect, useRef, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Webcam from 'react-webcam'; 
import { FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaCamera, FaSpinner } from 'react-icons/fa';
import { markAttendance } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';

const StudentScanner = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('Scan the Teacher\'s Screen');
  const [qrToken, setQrToken] = useState(null); 
  
  const webcamRef = useRef(null); 

  // 1. Capture Location
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error'); setMessage('Geolocation not supported'); return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => { setStatus('error'); setMessage('Location Permission Denied'); },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => { captureLocation(); }, []);

  const handleScan = (results) => {
    if (results && results.length > 0) {
        const token = results[0].rawValue;
        if (token && status === 'idle') {
            setQrToken(token); 
            
            // A. STOP the scanner immediately
            setStatus('camera_switching'); 
            setMessage("Switching to Selfie Camera...");

            // B. Wait 1.5 seconds for hardware to release
            setTimeout(() => {
                setStatus('selfie_mode'); 
                setMessage("Take a Selfie to verify it's you!");
            }, 1500);
        }
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  const captureAndSubmit = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setStatus('verifying');
    setMessage('Verifying Face & Location...');

    const selfieFile = dataURLtoFile(imageSrc, "selfie.jpg");

    const formData = new FormData();
    formData.append('qrToken', qrToken);
    formData.append('studentId', user.userId); 
    formData.append('lat', location ? location.lat : 0);
    formData.append('lng', location ? location.lng : 0);
    formData.append('file', selfieFile); 

    try {
        const result = await markAttendance(formData);

        if (result.status === 'SUCCESS') {
            setStatus('success');
            setMessage(result.message); 
        } else {
            setStatus('rejected');
            setMessage(result.message); 
        }
    } catch (e) {
        setStatus('error');
        setMessage("Server Connection Failed");
    }
  }, [webcamRef, qrToken, location]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative">
      
      {/* HEADER */}
      <div className="absolute top-0 w-full p-4 text-center z-10 bg-black/50 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-blue-400">Attendance Scanner</h2>
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <FaMapMarkerAlt />
            <span>{location ? `GPS Locked (${Math.round(location.accuracy)}m)` : "Locating..."}</span>
        </div>
      </div>

      {/* PHASE 1: QR SCANNER */}
      {status === 'idle' && (
        <div className="w-full max-w-md aspect-square relative border-2 border-blue-500 rounded-xl overflow-hidden">
             <Scanner onScan={handleScan} options={{ delayBetweenScanAttempts: 1000 }} />
             <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none"></div>
             <p className="absolute bottom-4 w-full text-center text-sm font-bold bg-black/50 p-2">Step 1: Scan Class QR</p>
        </div>
      )}

      {/* PHASE 1.5: SWITCHING (The Buffer) */}
      {status === 'camera_switching' && (
        <div className="w-full max-w-md aspect-square flex flex-col items-center justify-center bg-gray-900 rounded-xl">
             <FaSpinner className="text-4xl text-yellow-500 animate-spin mb-4" />
             <p className="text-gray-400">Switching Cameras...</p>
        </div>
      )}

      {/* PHASE 2: SELFIE CAMERA */}
      {status === 'selfie_mode' && (
         <div className="flex flex-col items-center w-full max-w-md">
            <div className="relative border-2 border-yellow-400 rounded-xl overflow-hidden aspect-[3/4] w-64 bg-black">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ 
                        facingMode: "user",
                        width: 480,    // Force low res for speed
                        height: 640
                    }} 
                    onUserMediaError={(e) => console.log("Camera Error:", e)}
                    className="w-full h-full object-cover"
                />
            </div>
            <p className="mt-4 text-yellow-400 font-bold animate-pulse">Step 2: Verify Identity</p>
            
            <button 
                onClick={captureAndSubmit}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
            >
                <FaCamera /> CAPTURE & MARK
            </button>
         </div>
      )}

      {/* PHASE 3: LOADING */}
      {status === 'verifying' && (
          <div className="animate-pulse text-xl font-bold text-blue-400 text-center">
              <div className="mb-4 text-4xl">🤖</div>
              Analyzing Biometrics...
          </div>
      )}

      {/* PHASE 4: SUCCESS */}
      {status === 'success' && (
        <div className="bg-green-600 p-8 rounded-full flex flex-col items-center animate-bounce">
            <FaCheckCircle className="text-6xl text-white" />
            <h2 className="mt-4 text-2xl font-bold">Marked Attendance.!</h2>
            <p className="text-sm mt-2">Face Verified</p>
        </div>
      )}

      {/* PHASE 5: REJECTED */}
      {status === 'rejected' && (
        <div className="bg-red-600 p-8 rounded-2xl flex flex-col items-center text-center max-w-xs">
            <FaTimesCircle className="text-6xl text-white" />
            <h2 className="mt-4 text-2xl font-bold">Attendance Denied.!</h2>
            <p className="mt-2 font-mono text-sm bg-black/20 p-2 rounded">{message}</p>
            <button onClick={() => { setQrToken(null); setStatus('idle'); }} className="mt-6 bg-white text-red-600 px-6 py-2 rounded-full font-bold">Try Again</button>
        </div>
      )}

    </div>
  );
};

export default StudentScanner;