import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getQrToken } from '../../services/qrAttendanceService.js';
import { FaClock, FaSync } from 'react-icons/fa'; 

const LiveQR = ({ sessionId }) => {
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10); 

  const refreshQR = async () => {
    // 1. Fetch token from backend
    const data = await getQrToken(sessionId);

    // 2. If backend fails, fall back to a local string (for testing)
    const token = data?.qrToken || `${sessionId}-${Date.now()}`;

    setQrData(token);
    setTimeLeft(10);
  };

  useEffect(() => {
    refreshQR(); // Initial fetch

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR(); // Time's up! Fetch new code.
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); 
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">

      {/* Header Info */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Scan Attendance</h2>
        <p className="text-gray-500 mt-2">Session ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{sessionId}</span></p>
      </div>

      {/* The QR Code */}
      <div className="p-4 bg-white border-4 border-blue-500 rounded-lg shadow-inner">
        {qrData ? (
          <QRCodeSVG value={qrData} size={256} />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
            <FaSync className="animate-spin text-gray-400 text-4xl" />
          </div>
        )}
      </div>

      {/* The Countdown Timer */}
      <div className="mt-6 flex items-center space-x-2 text-xl font-semibold text-blue-600">
        <FaClock />
        <span>Refreshing in {timeLeft}s</span>
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center max-w-xs">
        This code expires every 10 seconds.
      </p>
    </div>
  );
};

export default LiveQR;