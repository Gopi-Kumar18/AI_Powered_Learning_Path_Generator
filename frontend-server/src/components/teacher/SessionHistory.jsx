import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaArrowLeft, FaEye, FaCheckCircle } from 'react-icons/fa';
import { getTeacherSessions, getLiveSessionLogs, downloadAttendanceCSV } from '../../services/qrAttendanceService';

const SessionHistory = ({ onBack }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for detailed view
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      // Hardcoded TEACHER-001 for now until auth is fully dynamic
      const data = await getTeacherSessions("TEACHER-001");
      setSessions(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const handleViewDetails = async (sessionId) => {
    setSelectedSession(sessionId);
    setLogsLoading(true);
    const data = await getLiveSessionLogs(sessionId);
    setSessionLogs(data.logs);
    setLogsLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaCalendarAlt className="text-cyan-500" /> Session History
        </h2>
        {selectedSession ? (
           <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 transition">
             <FaArrowLeft /> Back to List
           </button>
        ) : (
           <button onClick={onBack} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 transition">
             <FaArrowLeft /> Dashboard
           </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10 animate-pulse">Loading history...</div>
      ) : selectedSession ? (
        /* --- DETAILED VIEW --- */
        <div className="space-y-4">
           {/* <h3 className="text-lg font-bold text-gray-300 mb-4 font-mono">{selectedSession}</h3> */}

           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-gray-300 font-mono">ID: {selectedSession}</h3>
              
              <button 
                onClick={() => downloadAttendanceCSV(selectedSession)}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export CSV
              </button>
           </div>

           {logsLoading ? (
              <div className="text-center text-gray-500">Fetching attendance records...</div>
           ) : sessionLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {sessionLogs.map((log, i) => (
                    <div key={i} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700">
                       <div className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-500" />
                          <span className="font-bold text-gray-200">{log.studentId}</span>
                       </div>
                       <span className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-lg">{log.time}</span>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="text-center text-gray-500 py-10">No students attended this session.</div>
           )}
        </div>
      ) : (
        /* --- LIST VIEW --- */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Subject & Date</th>
                <th className="px-6 py-4">Session ID</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Present</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-200 text-base">{s.subject}</p>
                    <p className="text-xs mt-1">{s.date} • {s.time}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{s.sessionId}</td>
                  <td className="px-6 py-4 text-center">
                    {s.isMakeup ? (
                       <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20">Makeup</span>
                    ) : (
                       <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <FaUsers className="text-gray-500" />
                       <span className="font-bold text-gray-300 text-lg">{s.totalPresent}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewDetails(s.sessionId)}
                      className="bg-gray-800 hover:bg-cyan-600 hover:text-white text-cyan-500 p-3 rounded-xl transition-all duration-300"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                   <td colSpan="5" className="text-center py-10">No sessions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;