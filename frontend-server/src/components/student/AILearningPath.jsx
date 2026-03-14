import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaMagic, FaBookOpen, FaArrowLeft, FaBrain } from 'react-icons/fa';
import { getAILearningPath } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';

const AILearningPath = ({ onBack, onNavigateToAssessment }) => {
  const { user } = useAuth();
  
  // Available subjects (Matches our Timetable)
  const subjects = ["Java Programming", "DSA", "OS", "Computer Networks", "Verbal Ability", "OS LAB"];
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchPath = async (subject) => {
    if (!subject) return;
    setSelectedSubject(subject);
    setLoading(true);
    setRoadmap(null); 

    const result = await getAILearningPath(user.userId, subject);
    
    if (result.status === 'SUCCESS') {
      setRoadmap(result.data.aiGeneratedRoadmap);
    } 
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <FaRobot className="text-purple-600" /> AI Study Advisor
          </h2>
          <p className="text-slate-500 mt-1">Get personalized learning roadmaps based on your current attendance.</p>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-purple-600 flex items-center gap-2 transition font-bold">
          <FaArrowLeft /> Dashboard
        </button>
      </div>

      {/* Subject Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => fetchPath(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-slate-700 bg-slate-50"
          >
            <option value="">-- Choose a Subject --</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        
        { /* This button now redirects to the Assessment View */}
        <button 
          onClick={onNavigateToAssessment}
          className="w-full md:w-auto mt-6 md:mt-0 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30">
          <FaBrain /> Take Assessment to Generate
        </button>
        
      </div>

      {/* AI Output Canvas */}
      <div className="bg-white min-h-[400px] rounded-2xl shadow-sm border border-gray-100 p-8">
        {loading ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
             <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
             <p className="font-bold animate-pulse">Checking records...</p>
           </div>
        ) : generating ? (
           <div className="h-full flex flex-col items-center justify-center text-purple-600 space-y-4 py-20">
             <FaRobot className="text-6xl animate-bounce" />
             <p className="font-bold text-lg animate-pulse">AI is analyzing your attendance and building a custom plan...</p>
           </div>
        ) : roadmap ? (
           <div className="prose prose-slate max-w-none prose-headings:text-purple-900 prose-a:text-purple-600 prose-strong:text-slate-800">
             {/* This magically renders the Gemini Markdown into styled HTML */}
             <ReactMarkdown>{roadmap}</ReactMarkdown>
           </div>
        ) : selectedSubject ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
             <FaBookOpen className="text-5xl mb-4 opacity-20" />
             <p className="font-bold">No roadmap exists for this subject yet.</p>
             <p className="text-sm">Click "Generate Fresh Roadmap" to create one!</p>
           </div>
        ) : (
           <div className="h-full flex items-center justify-center text-slate-400 py-20">
             <p>Select a subject above to begin.</p>
           </div>
        )}
      </div>

    </div>
  );
};

export default AILearningPath;