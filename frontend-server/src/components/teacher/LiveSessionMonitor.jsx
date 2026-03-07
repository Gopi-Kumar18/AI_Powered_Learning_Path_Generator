// File: src/components/teacher/LiveSessionMonitor.jsx
import { useState, useEffect } from 'react';
import { FaUserCheck, FaClock } from 'react-icons/fa';
import { getLiveSessionLogs } from '../../services/qrAttendanceService';

const LiveSessionMonitor = ({ sessionId }) => {
  const [logs, setLogs] = useState([]);
  const [totalPresent, setTotalPresent] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch immediately on load
    const fetchLogs = async () => {
      const data = await getLiveSessionLogs(sessionId);
      setLogs(data.logs);
      setTotalPresent(data.totalPresent);
    };
    fetchLogs();

    // Poll the backend every 3 seconds for new scans
    const interval = setInterval(fetchLogs, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Monitoring
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">{sessionId}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold text-xl">
          {totalPresent} <span className="text-xs text-blue-500 uppercase tracking-wide">Present</span>
        </div>
      </div>

      {/* Live Table */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FaClock className="text-4xl mb-3 opacity-20" />
            <p className="text-sm">Waiting for students to scan...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <FaUserCheck />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{log.studentId}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                       Biometric Verified
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
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