import { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaQrcode, FaHistory, FaChartBar, FaUser, FaSignOutAlt, FaUserGraduate, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

import TeacherHome from '../components/teacher/TeacherHome';
import CreateSession from '../components/teacher/CreateSession';
import LiveQR from '../components/teacher/LiveQR';
import LiveSessionMonitor from '../components/teacher/LiveSessionMonitor';
import SessionHistory from '../components/teacher/SessionHistory';
import TeacherAnalytics from '../components/teacher/TeacherAnalytics';
import ManageStudents from '../components/teacher/ManageStudents';
import TeacherProfile from '../components/teacher/TeacherProfile';


const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options).toUpperCase());
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChalkboardTeacher /> },
    { id: 'start-session', label: 'Start Session', icon: <FaQrcode /> },
    { id: 'history', label: 'Session History', icon: <FaHistory /> },
    { id: 'manage-students', label: 'Manage Students', icon: <FaUserGraduate /> },
    { id: 'analytics', label: 'Student Analytics', icon: <FaChartBar /> },
    { id: 'profile', label: 'My Profile', icon: <FaUser /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      <Helmet>
          <title>Teacher Dashboard | SmartPathMaker</title>
          <meta name="description" content="Teacher dashboard for managing classes and students." />
      </Helmet>
      
      {/* SIDEBAR */}
      <div className={`bg-slate-900 text-white flex flex-col justify-between shadow-2xl z-20 transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-900/50">
            <div className="min-w-[32px] w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">S</div>
            <h1 className="text-xl font-black tracking-wider">SALS</h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
                  ${view === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="min-w-[40px] w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate text-sm">{user?.name || 'Professor'}</p>
              <p className="text-xs text-slate-400 truncate">ID: {user?.userId}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 py-3 rounded-xl font-bold transition-colors">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        
        {/* HEADER */}
        <div className="h-20 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
            >
              <FaBars className="text-2xl" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 capitalize tracking-tight hidden sm:block">
              {view.replace('-', ' ')}
            </h2>
          </div>
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full hidden sm:block">{currentDate}</span>
        </div>

        {/* SCROLLABLE VIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {view === 'dashboard' && (
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              <TeacherHome onViewChange={setView} />
            </div>
          )}

          {/*Teacher Session Creation UI + LiveQR Code Generator + Live Session Monitor + */}
          {view === 'start-session' && (
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              {!activeSessionId ? (
                <div className="max-w-3xl mx-auto">
                   <CreateSession onSessionStarted={(id) => setActiveSessionId(id)} />
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                     <p className="font-bold text-slate-500 px-4">Session is Live</p>
                     <button 
                       onClick={() => setActiveSessionId(null)} 
                       className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 px-6 py-2 rounded-xl font-bold transition-all shadow-sm"
                     >
                       End Live Session
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <LiveQR sessionId={activeSessionId} />
                     <LiveSessionMonitor sessionId={activeSessionId} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/** Session History */}
          {view === 'history' && (
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              <SessionHistory onBack={() => setView('dashboard')} />
            </div>
          )}
          
          {/* Manage Students */}
          {view === 'manage-students' && (
            <div className="max-w-6xl mx-auto animate-fade-in-up">
               <ManageStudents onBack={() => setView('dashboard')} />
            </div>
          )}

          {/* Student Analytics */}
          {view === 'analytics' && (
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              <TeacherAnalytics onBack={() => setView('dashboard')} />
            </div>
          )}

          {/* Teacher Profile */}
          {view === 'profile' && (
            <TeacherProfile />
          )}

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;


