import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPlay, FaLayerGroup, FaBook } from 'react-icons/fa';
import { startSession } from '../../services/qrAttendanceService';
import { getAllSubjects } from '../../services/adminService';

const CreateSession = ({ onSessionStarted }) => {
  const [subjectCode, setSubjectCode] = useState('');
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);


    useEffect(() => {
      const fetchSubjects = async () => {
        const data = await getAllSubjects();
        setAvailableSubjects(data);
      };
      fetchSubjects();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await startSession(subjectCode, batch);
    if (data && data.status === "SUCCESS" && data.sessionId) {
        onSessionStarted(data.sessionId); 
    } else {
      console.log(data?.message);
        alert("Failed to start session.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm relative overflow-hidden">

      <Helmet>
          <title>TeacherDashboard | Create Session | SmartPathMaker</title>
          <meta name="description" content="Teacher dashboard for creating attendance sessions." />
      </Helmet>

      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
        Configure Session
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Subject</label>
          <div className="relative">
            <FaBook className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" />
            <select
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            >
              <option value="" disabled>-- Choose an Official Subject --</option>
              {availableSubjects.map(sub => (
                <option key={sub.code} value={sub.code}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Batch / Section</label>
          <div className="relative">
            <FaLayerGroup className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g. 2024-CS-A"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !subjectCode}
          className={`w-full flex items-center justify-center gap-3 py-4 mt-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl
            ${(loading || !subjectCode)
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:scale-[1.02]'}`}
        >
          {loading ? "Generating Secure Codes..." : <><FaPlay className="text-sm" /> Start Attendance</>}
        </button>
      </form>
    </div>
  );
};

export default CreateSession;