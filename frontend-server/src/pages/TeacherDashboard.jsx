import { useState } from 'react';
import CreateSession from '../components/teacher/CreateSession';
import LiveQR from '../components/teacher/LiveQR';

const TeacherDashboard = () => {
  const [activeSessionId, setActiveSessionId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">

      <h1 className="text-4xl font-extrabold text-blue-900 mb-8">
        Smart Attendance System
      </h1>

      {/* Conditional Rendering: Form OR QR Screen */}
      {!activeSessionId ? (
        <CreateSession onSessionStarted={(id) => setActiveSessionId(id)} />
      ) : (
        <div className="animate-fade-in-up">
           <button
             onClick={() => setActiveSessionId(null)}
             className="mb-4 text-sm text-gray-500 hover:text-red-500 underline"
           >
             ← End Session
           </button>
           <LiveQR sessionId={activeSessionId} />
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;