import { useState } from 'react';
import { FaChalkboardTeacher, FaChartPie, FaHistory, FaUserGraduate, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import CreateSession from '../components/teacher/CreateSession'; // Ensure path is correct based on your folder structure
import LiveQR from '../components/teacher/LiveQR';             
import LiveSessionMonitor from '../components/teacher/LiveSessionMonitor'; // New component for live monitoring

const TeacherDashboard = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'create', 'live'
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Helper to handle feature clicks
  const handleFeatureClick = (feature) => {
    if (feature === 'start_session') {
      setView('create');
    } else {
      setNotification(`${feature} is currently under development. Available soon!`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSessionStart = (id) => {
    setActiveSessionId(id);
    setView('live');
  };

  const handleEndSession = () => {
    setActiveSessionId(null);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* 1. TOP NAVIGATION (Glassmorphism) */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <span className="font-bold text-black text-xl">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-100">SALS <span className="text-cyan-400 font-light">Teacher</span></span>
            </div>

            {/* Profile / Logout */}
            <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium">
              <span className="hidden sm:block">Logout</span>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 bg-gray-800 border-l-4 border-cyan-500 text-cyan-100 p-4 rounded shadow-2xl animate-fade-in-down z-50">
            <p className="font-medium">🚀 {notification}</p>
          </div>
        )}

        {/* VIEW: DASHBOARD GRID */}
        {view === 'dashboard' && (
          <div className="animate-fade-in-up">
            <header className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Professor</span>
              </h1>
              <p className="text-gray-400">Manage your classes and attendance efficiently.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Start Session (Active) */}
              <DashboardCard 
                icon={<FaChalkboardTeacher className="text-3xl text-black" />}
                title="Start Live Class"
                desc="Generate QR code for today's attendance."
                active={true}
                onClick={() => handleFeatureClick('start_session')}
              />

              {/* Card 2: Analytics (Inactive) */}
              <DashboardCard 
                icon={<FaChartPie className="text-3xl text-gray-500" />}
                title="Attendance Analytics"
                desc="View graphs and monthly reports."
                active={false}
                onClick={() => handleFeatureClick('Analytics')}
              />

              {/* Card 3: History (Inactive) */}
              <DashboardCard 
                icon={<FaHistory className="text-3xl text-gray-500" />}
                title="Session History"
                desc="Review past classes and logs."
                active={false}
                onClick={() => handleFeatureClick('History')}
              />

              {/* Card 4: Students (Inactive) */}
              <DashboardCard 
                icon={<FaUserGraduate className="text-3xl text-gray-500" />}
                title="Manage Students"
                desc="View profiles and edit details."
                active={false}
                onClick={() => handleFeatureClick('Students')}
              />
            </div>
          </div>
        )}

        {/* VIEW: CREATE SESSION FORM */}
        {view === 'create' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <button onClick={() => setView('dashboard')} className="flex items-center text-gray-400 hover:text-cyan-400 mb-6 transition">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <CreateSession onSessionStarted={handleSessionStart} />
          </div>
        )}

        {/* VIEW: LIVE QR */}
        {view === 'live' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
             <div className="flex justify-between items-center mb-6">
                <button onClick={handleEndSession} className="flex items-center text-red-400 hover:text-red-300 transition bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
                  <FaArrowLeft className="mr-2" /> End Session
                </button>
                <span className="text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live
                </span>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-1.3 gap-8 items-start">
                 <LiveQR sessionId={activeSessionId} />
                 <div className="h-[500px]"> {/* Forces monitor to match QR height */}
                     <LiveSessionMonitor sessionId={activeSessionId} />
                 </div>
             </div>

          </div>
        )}

      </main>
    </div>
  );
};

// Reusable Card Component
const DashboardCard = ({ icon, title, desc, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
      ${active 
        ? 'bg-gray-900 border-gray-700 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
        : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900 opacity-75 grayscale hover:grayscale-0'}
    `}
  >
    <div className={`
      w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors
      ${active ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-gray-800'}
    `}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
    
    {!active && (
      <div className="absolute top-4 right-4 px-2 py-1 bg-gray-800 text-xs font-mono text-gray-500 rounded border border-gray-700">
        SOON
      </div>
    )}
  </div>
);

export default TeacherDashboard;



// import { useState } from 'react';
// import CreateSession from '../components/teacher/CreateSession';
// import LiveQR from '../components/teacher/LiveQR';

// const TeacherDashboard = () => {
//   const [activeSessionId, setActiveSessionId] = useState(null);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">

//       <h1 className="text-4xl font-extrabold text-blue-900 mb-8">
//         Smart Attendance System
//       </h1>

//       {/* Conditional Rendering: Form OR QR Screen */}
//       {!activeSessionId ? (
//         <CreateSession onSessionStarted={(id) => setActiveSessionId(id)} />
//       ) : (
//         <div className="animate-fade-in-up">
//            <button
//              onClick={() => setActiveSessionId(null)}
//              className="mb-4 text-sm text-gray-500 hover:text-red-500 underline"
//            >
//              ← End Session
//            </button>
//            <LiveQR sessionId={activeSessionId} />
//         </div>
//       )}

//     </div>
//   );
// };

// export default TeacherDashboard;