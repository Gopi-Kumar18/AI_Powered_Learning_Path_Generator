import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getQrToken } from '../../services/qrAttendanceService.js';
import { FaClock, FaSync, FaShieldAlt } from 'react-icons/fa'; 

const LiveQR = ({ sessionId }) => {
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10); 
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQR = async () => {
    setIsRefreshing(true);

  try {
    const data = await getQrToken(sessionId);
    
    if (data && data.qrToken) {
      setQrData(data.qrToken);
      setTimeLeft(10);
    } else {
      // If backend returns null or error, clear the QR
      setQrData(null); 
      console.error("Backend failed to provide a token.");
    }
  } catch (error) {
    setQrData(null);
    console.error("Backend is offline.");
  } finally {
    setIsRefreshing(false);
  }
};

  useEffect(() => {
    refreshQR(); 

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR(); 
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); 
  }, [sessionId]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl">

      {/* LEFT: Info Panel */}
      <div className="text-center lg:text-left space-y-4">
        <h2 className="text-3xl font-extrabold text-white">
          Scan to Mark <span className="text-cyan-400">Attendance</span>
        </h2>
        
        <div className="bg-gray-950 inline-block px-4 py-2 rounded-lg border border-gray-800">
           <p className="text-gray-400 text-sm">Session ID</p>
           <p className="text-xl font-mono text-cyan-400 tracking-wider">{sessionId}</p>
        </div>

        <div className="flex items-center justify-center lg:justify-start gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-green-500" /> Secure
          </div>
          <div className="flex items-center gap-2">
             <FaSync className={`text-cyan-500 ${isRefreshing ? 'animate-spin' : ''}`} /> Auto-Refresh
          </div>
        </div>
      </div>

      {/* RIGHT: The QR Container */}
      <div className="relative group">
        {/* Glow Effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-white p-4 rounded-xl">
           {qrData ? (
             <QRCodeSVG value={qrData} size={280} level="H" />
           ) : (
             <div className="w-[280px] h-[280px] flex items-center justify-center bg-gray-100 rounded">
               <FaSync className="animate-spin text-gray-300 text-4xl" />
             </div>
           )}
           
           {/* Timer Overlay */}
           <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-cyan-400 px-4 py-1 rounded-full border border-gray-700 text-sm font-bold flex items-center gap-2 shadow-lg">
              <FaClock /> {timeLeft}s
           </div>
        </div>
      </div>

    </div>
  );
};

export default LiveQR;



// import { useEffect, useState } from 'react';
// import { QRCodeSVG } from 'qrcode.react';
// import { getQrToken } from '../../services/qrAttendanceService.js';
// import { FaClock, FaSync } from 'react-icons/fa'; 

// const LiveQR = ({ sessionId }) => {
//   const [qrData, setQrData] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(10); 

//   const refreshQR = async () => {
//     // 1. Fetch token from backend
//     const data = await getQrToken(sessionId);

//     // 2. If backend fails, fall back to a local string (for testing)
//     const token = data?.qrToken || `${sessionId}-${Date.now()}`;

//     setQrData(token);
//     setTimeLeft(10);
//   };

//   useEffect(() => {
//     refreshQR(); // Initial fetch

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           refreshQR(); // Time's up! Fetch new code.
//           return 10;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer); 
//   }, [sessionId]);

//   return (
//     <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">

//       {/* Header Info */}
//       <div className="text-center mb-6">
//         <h2 className="text-3xl font-bold text-gray-800">Scan Attendance</h2>
//         <p className="text-gray-500 mt-2">Session ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{sessionId}</span></p>
//       </div>

//       {/* The QR Code */}
//       <div className="p-4 bg-white border-4 border-blue-500 rounded-lg shadow-inner">
//         {qrData ? (
//           <QRCodeSVG value={qrData} size={256} />
//         ) : (
//           <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
//             <FaSync className="animate-spin text-gray-400 text-4xl" />
//           </div>
//         )}
//       </div>

//       {/* The Countdown Timer */}
//       <div className="mt-6 flex items-center space-x-2 text-xl font-semibold text-blue-600">
//         <FaClock />
//         <span>Refreshing in {timeLeft}s</span>
//       </div>

//       <p className="mt-4 text-sm text-gray-400 text-center max-w-xs">
//         This code expires every 10 seconds.
//       </p>
//     </div>
//   );
// };

// export default LiveQR;