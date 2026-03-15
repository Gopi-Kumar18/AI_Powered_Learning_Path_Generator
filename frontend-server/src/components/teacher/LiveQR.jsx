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
        setQrData(null); 
      }
    } catch (error) {
      setQrData(null);
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
    <div className="flex flex-col items-center justify-between p-8 bg-white rounded-3xl border border-slate-200 shadow-sm h-[500px]">
      
      {/* Top Text Section */}
      <div className="text-center w-full">
        <h2 className="text-2xl font-black text-slate-800 mb-4">
          Scan to Mark <span className="text-blue-600">Attendance</span>
        </h2>
        
        <div className="bg-slate-50 inline-block px-6 py-2 rounded-xl border border-slate-200 w-full max-w-xs">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Session ID</p>
           <p className="text-xl font-mono font-bold text-blue-600 tracking-wider break-all">{sessionId}</p>
        </div>

        <div className="flex items-center justify-center gap-6 text-slate-500 text-xs font-bold mt-4">
          <div className="flex items-center gap-2"><FaShieldAlt className="text-green-500" /> Secure Mode</div>
          <div className="flex items-center gap-2"><FaSync className={`text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} /> Auto-Refresh</div>
        </div>
      </div>

      {/* Bottom QR Section */}
      <div className="relative group p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner mt-4">
        <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
           {qrData ? (
             <QRCodeSVG value={qrData} size={220} level="H" />
           ) : (
             <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-50 rounded-xl text-slate-300">
               <FaSync className="animate-spin text-4xl" />
             </div>
           )}
           <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-lg text-sm border-2 border-white">
              <FaClock className="text-blue-400" /> {timeLeft}s
           </div>
        </div>
      </div>
      
    </div>
  );
};

export default LiveQR;


