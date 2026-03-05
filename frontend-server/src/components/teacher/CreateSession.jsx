import { useState } from 'react';
import { FaPlay, FaLayerGroup, FaBook } from 'react-icons/fa';
import { startSession } from '../../services/qrAttendanceService';

const CreateSession = ({ onSessionStarted }) => {
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = await startSession(subject, batch);

    if (data && data.sessionId) {
        // Pass the REAL ID (DATASTRUCTURES-177...) to the parent
        onSessionStarted(data.sessionId); 
    } else {
        alert("Failed to start session. Check console.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
        Configure Session
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        
        {/* Subject Input */}
        <div className="group">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Name</label>
          <div className="relative">
            <FaBook className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="e.g. Advanced Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        {/* Batch Input */}
        <div className="group">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Batch / Section</label>
          <div className="relative">
            <FaLayerGroup className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="e.g. 2024-CS-A"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all duration-300
            ${loading 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/30 transform hover:-translate-y-1'}
          `}
        >
          {loading ? (
            <>Generating Secure Codes...</>
          ) : (
            <>
              <FaPlay className="text-sm" /> Start Attendance
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateSession;


// import { useState } from 'react';
// import { startSession } from '../../services/qrAttendanceService.js';

// const CreateSession = ({ onSessionStarted }) => {
//   const [subject, setSubject] = useState('');
//   const [batch, setBatch] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     setTimeout(() => {
//         const mockSessionId = `SESSION-${Math.floor(Math.random() * 1000)}`;
//         onSessionStarted(mockSessionId);
//         setLoading(false);
//     }, 1000);
//   };

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto mt-10 border border-gray-100">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">Start New Class</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Subject Name</label>
//           <input
//             type="text"
//             required
//             className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//             placeholder="e.g. Data Structures"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">Section ID</label>
//           <input
//             type="text"
//             required
//             className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//             placeholder="e.g. 2024-CS-A"
//             value={batch}
//             onChange={(e) => setBatch(e.target.value)}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
//         >
//           {loading ? 'Creating Session...' : 'Generate QR Code'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateSession;