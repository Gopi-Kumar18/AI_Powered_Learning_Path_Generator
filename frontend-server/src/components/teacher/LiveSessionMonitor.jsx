import { useState, useEffect } from 'react';
import { FaUserCheck, FaClock } from 'react-icons/fa';
import { getLiveSessionLogs } from '../../services/qrAttendanceService';

const LiveSessionMonitor = ({ sessionId }) => {
  const [logs, setLogs] = useState([]);
  const [totalPresent, setTotalPresent] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    const fetchLogs = async () => {
      const data = await getLiveSessionLogs(sessionId);
      setLogs(data.logs);
      setTotalPresent(data.totalPresent);
    };
    fetchLogs(); 
    const interval = setInterval(fetchLogs, 3000); 

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[500px] overflow-hidden">
      
      <Helmet>
          <title>TeacherDB | Live Session Monitor | SmartPathMaker</title>
          <meta name="description" content="Teacher dashboard for managing live attendance sessions." />
      </Helmet>

      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
            Live Monitoring
          </h3>
          <p className="text-sm font-bold text-slate-400 mt-1 font-mono tracking-wider">{sessionId}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-5 py-2 rounded-xl font-black text-2xl border border-blue-200 shadow-sm flex items-center gap-2">
          {totalPresent} <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Present</span>
        </div>
      </div>

      {/* Live Table */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FaClock className="text-5xl mb-4 opacity-20" />
            <p className="font-bold text-lg text-slate-500">Waiting for scans...</p>
            <p className="text-sm mt-1">Students will appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in-up hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl shadow-inner border border-green-100">
                    <FaUserCheck />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{log.studentId}</p>
                    <p className="text-xs font-bold text-slate-400">Biometric Verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 font-mono shadow-sm">
                    {log.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionMonitor;



