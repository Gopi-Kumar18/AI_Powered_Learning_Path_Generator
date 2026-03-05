
//improved UI - 2
import { useState, useEffect, useRef, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Webcam from 'react-webcam'; 
import { FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaCamera, FaSpinner, FaQrcode, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import { markAttendance } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';

const StudentScanner = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [qrToken, setQrToken] = useState(null); 
  const webcamRef = useRef(null); 

  // --- LOCATION LOGIC ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('rejected'); 
      setMessage('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      (err) => { 
        // Keep checking or show error
        console.log("GPS Error", err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // --- STEPPER HELPERS ---
  const getStepStatus = (stepIndex) => {
    // 1: Scan, 2: Selfie, 3: Verify
    if (status === 'idle' && stepIndex === 1) return 'active';
    if (status === 'idle' && stepIndex > 1) return 'inactive';
    
    if ((status === 'camera_switching' || status === 'selfie_mode') && stepIndex === 1) return 'completed';
    if ((status === 'camera_switching' || status === 'selfie_mode') && stepIndex === 2) return 'active';
    if ((status === 'camera_switching' || status === 'selfie_mode') && stepIndex === 3) return 'inactive';

    if (status === 'verifying' && stepIndex < 3) return 'completed';
    if (status === 'verifying' && stepIndex === 3) return 'active';

    if ((status === 'success' || status === 'rejected') && stepIndex <= 3) return 'completed';
    return 'inactive';
  };

  // --- SCAN LOGIC ---
  const handleScan = (results) => {
    if (results && results.length > 0) {
        const token = results[0].rawValue;
        if (token && status === 'idle') {
            if (!location) {
               alert("Please wait for GPS lock before scanning!");
               return;
            }
            setQrToken(token); 
            setStatus('camera_switching'); 
            setTimeout(() => {
                setStatus('selfie_mode'); 
            }, 1500);
        }
    }
  };

  // --- SUBMIT LOGIC ---
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  }

  const captureAndSubmit = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setStatus('verifying');
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
            setStatus('success'); setMessage(result.message); 
        } else {
            setStatus('rejected'); setMessage(result.message); 
        }
    } catch (e) {
        setStatus('rejected'); setMessage("Server Connection Failed");
    }
  }, [webcamRef, qrToken, location, user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COL: SCANNER & PROCESS */}
      <div className="lg:col-span-2 space-y-6">
         
         {/* 1. HEADER & WARNING */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Mark Attendance</h2>
            <div className="flex items-start gap-3 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
               <FaInfoCircle className="mt-0.5 shrink-0" />
               <p>Ensure location access is enabled. Your GPS coordinates are recorded for verification, and kindly wait until the GPS is locked before scanning.</p>
            </div>
         </div>

         {/* 2. MAIN CARD */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Stepper Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
               <div className="flex items-center justify-between max-w-md mx-auto">
                  <StepIndicator number="1" label="Scan QR" status={getStepStatus(1)} />
                  <div className={`flex-1 h-0.5 mx-2 ${getStepStatus(1) === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <StepIndicator number="2" label="Take Selfie" status={getStepStatus(2)} />
                  <div className={`flex-1 h-0.5 mx-2 ${getStepStatus(2) === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <StepIndicator number="3" label="Verify" status={getStepStatus(3)} />
               </div>
            </div>

            {/* Viewport Content */}
            <div className="p-8 min-h-[450px] flex flex-col items-center justify-center bg-black relative">
               
               {/* STATUS: IDLE (QR SCAN) */}
               {status === 'idle' && (
                  <div className="w-full max-w-sm relative">
                     <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden relative border border-gray-700">
                        <Scanner onScan={handleScan} />
                        {/* Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-56 h-56 border-2 border-blue-500 rounded-lg relative">
                              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                           </div>
                        </div>
                     </div>
                     <button className="mt-6 w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition flex items-center justify-center gap-2">
                        <FaQrcode /> Simulate QR Scan
                     </button>
                  </div>
               )}

               {/* STATUS: SWITCHING */}
               {status === 'camera_switching' && (
                  <div className="text-white flex flex-col items-center animate-pulse">
                     <FaSpinner className="text-5xl mb-4 animate-spin text-blue-500" />
                     <p>Switching to Selfie Camera...</p>
                  </div>
               )}

               {/* STATUS: SELFIE */}
               {status === 'selfie_mode' && (
                  <div className="w-full max-w-sm flex flex-col items-center">
                     <div className="aspect-[3/4] w-64 bg-gray-900 rounded-xl overflow-hidden relative shadow-2xl border-2 border-blue-500">
                        <Webcam
                           audio={false}
                           ref={webcamRef}
                           screenshotFormat="image/jpeg"
                           videoConstraints={{ facingMode: "user" }}
                           className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-40 h-56 border-2 border-dashed border-white/50 rounded-full"></div>
                        </div>
                     </div>
                     <p className="text-gray-400 text-sm mt-4 mb-6">Position your face clearly in the frame</p>
                     <button 
                        onClick={captureAndSubmit}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/50 transition-transform active:scale-95"
                     >
                        <FaCamera size={24} />
                     </button>
                  </div>
               )}

               {/* STATUS: VERIFYING */}
               {status === 'verifying' && (
                  <div className="text-center">
                     <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                     <h3 className="text-2xl font-bold text-white mb-2">Verifying Identity...</h3>
                     <p className="text-gray-400">Comparing with registered photo</p>
                  </div>
               )}

               {/* STATUS: SUCCESS */}
               {status === 'success' && (
                  <div className="text-center">
                     <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
                        <FaCheckCircle className="text-5xl text-white" />
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2">Attendance Recorded</h2>
                     <div className="inline-block bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-bold mb-6">
                        ✓ Present
                     </div>
                     <p className="text-gray-500 text-sm">{new Date().toLocaleTimeString()}</p>
                  </div>
               )}

               {/* STATUS: FAILED */}
               {status === 'rejected' && (
                  <div className="text-center">
                     <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/30">
                        <FaTimesCircle className="text-5xl text-white" />
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2">Attendance Failed</h2>
                     <div className="bg-red-900/30 border border-red-800 text-red-300 px-6 py-3 rounded-lg mb-8 max-w-xs mx-auto">
                        {message}
                     </div>
                     <button 
                        onClick={() => { setQrToken(null); setStatus('idle'); }}
                        className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
                     >
                        Try Again
                     </button>
                  </div>
               )}

            </div>
         </div>
      </div>

      {/* RIGHT COL: INFO & INSTRUCTIONS */}
      <div className="space-y-6">
         
         {/* Session Info Card */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100">Session Information</h3>
            <div className="space-y-4 text-sm">
               <InfoRow label="Date" value="Friday, February 27, 2026" />
               <InfoRow label="Course" value="Database Management Systems" />
               <InfoRow label="Code" value="CS302" />
               <InfoRow label="Slot" value="09:00 AM – 10:00 AM" />
               <InfoRow label="Room" value="Block A · Room 204" />
               <InfoRow label="Faculty" value="Dr. Priya Sharma" />
               <div className="flex justify-between pt-2">
                  <span className="text-slate-500">GPS Status</span>
                  <span className={`font-bold ${location ? 'text-green-600' : 'text-red-500'}`}>
                     {location ? 'Locked' : 'Unavailable'}
                  </span>
               </div>
            </div>
         </div>

         {/* Instructions Card */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4">Instructions</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600">
               <li>Ask your faculty to display the session QR code.</li>
               <li>Scan it using your device camera.</li>
               <li>Take a clear selfie for biometric verification.</li>
               <li>Attendance can only be marked within the classroom.</li>
            </ol>
         </div>

      </div>
    </div>
  );
};

// Helper Components
const StepIndicator = ({ number, label, status }) => {
   let bg = 'bg-gray-200 text-gray-500';
   if (status === 'active') bg = 'bg-blue-600 text-white ring-4 ring-blue-100';
   if (status === 'completed') bg = 'bg-green-500 text-white';

   return (
      <div className="flex items-center gap-2">
         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${bg}`}>
            {status === 'completed' ? '✓' : number}
         </div>
         <span className={`text-sm font-medium ${status === 'active' ? 'text-blue-700' : 'text-gray-500'}`}>{label}</span>
      </div>
   );
};

const InfoRow = ({ label, value }) => (
   <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
   </div>
);

export default StudentScanner;

