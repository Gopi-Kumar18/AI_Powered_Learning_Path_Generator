import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt, FaUsers, FaArrowLeft, FaEye, FaCheckCircle, FaDownload } from 'react-icons/fa';
import { getTeacherSessions, getLiveSessionLogs, downloadAttendanceCSV } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';

const SessionHistory = ({ onBack }) => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.userId) return;

      const data = await getTeacherSessions(user.userId);
      setSessions(data);
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  const handleViewDetails = async (sessionId) => {
    setSelectedSession(sessionId);
    setLogsLoading(true);
    const data = await getLiveSessionLogs(sessionId);
    setSessionLogs(data.logs);
    setLogsLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm animate-fade-in-up">

      <Helmet>
          <title>TeacherDashboard | Session History | SmartPathMaker</title>
          <meta name="description" content="Teacher dashboard for managing session history." />
      </Helmet>

      <div className="flex items-center justify-between mb-8 pb-4">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <FaCalendarAlt className="text-blue-600" /> Session History
        </h2>
        {selectedSession ? (
           <button onClick={() => setSelectedSession(null)} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition bg-slate-50 px-4 py-2 rounded-xl">
             <FaArrowLeft /> Back to List
           </button>
        ) : onBack ? (
           <button onClick={onBack} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition bg-slate-50 px-4 py-2 rounded-xl">
             <FaArrowLeft /> Dashboard
           </button>
        ) : null}
      </div>

      {loading ? (
        <div className="text-center font-bold text-slate-400 py-10 animate-pulse">Loading history...</div>
      ) : selectedSession ? (
        /* DETAILED VIEW */
        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Session Details</p>
                <h3 className="text-xl font-black text-slate-800 font-mono">{selectedSession}</h3>
              </div>
              <button 
                onClick={() => downloadAttendanceCSV(selectedSession)}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 flex items-center gap-2 hover:scale-105"
              >
                <FaDownload /> Export CSV
              </button>
           </div>

           {logsLoading ? (
              <div className="text-center font-bold text-slate-400 py-10">Fetching attendance records...</div>
           ) : sessionLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {sessionLogs.map((log, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl flex justify-between items-center border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                       <div className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-500 text-xl" />
                          <span className="font-bold text-slate-800 text-lg">{log.studentId}</span>
                       </div>
                       <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{log.time}</span>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="text-center font-bold text-slate-400 py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                 No students attended this session.
              </div>
           )}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 font-bold tracking-wider">Subject & Date</th>
                <th className="px-6 py-5 font-bold tracking-wider">Session ID</th>
                <th className="px-6 py-5 font-bold tracking-wider text-center">Type</th>
                <th className="px-6 py-5 font-bold tracking-wider text-center">Present</th>
                <th className="px-6 py-5 font-bold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sessions.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800 text-base">{s.subject}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{s.date} • {s.time}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-600 text-xs">{s.sessionId}</td>
                  <td className="px-6 py-4 text-center">
                    {s.isMakeup ? (
                       <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">Makeup</span>
                    ) : (
                       <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <FaUsers className="text-slate-400" />
                       <span className="font-black text-slate-700 text-lg">{s.totalPresent}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewDetails(s.sessionId)}
                      className="bg-slate-100 hover:bg-blue-600 hover:text-white text-blue-600 p-3 rounded-xl transition-all shadow-sm"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                   <td colSpan="5" className="text-center font-bold text-slate-400 py-10">No sessions recorded yet.</td>
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



