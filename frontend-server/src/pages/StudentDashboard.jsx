import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaThLarge, FaQrcode, FaHistory, FaUser, FaSignOutAlt, FaBars, FaChevronRight, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaExclamationTriangle, FaClock, FaRobot, FaBrain } from 'react-icons/fa';
import StudentScanner from '../components/student/StudentScanner';
import { useAuth } from '../context/AuthContext';
import StudentProfile from '../components/student/StudentProfile';
import AILearningPath from '../components/student/AILearningPath';
import StudentAssessment from '../components/student/StudentAssessment';

// Timetable UI Data
const TIMETABLE = {
  Monday: [{ time: '9:00 AM - 10:00 AM', name: 'OS' }, { time: '10:00 AM - 11:00 AM', name: 'Computer Networks' }, { time: '11:00 AM - 12:00 PM', name: 'Java Programming' }, { time: '1:00 PM - 2:00 PM', name: 'OS Lab' }],
  Tuesday: [{ time: '9:00 AM - 10:00 AM', name: 'OS' }, { time: '10:00 AM - 11:00 AM', name: 'Computer Networks' }, { time: '11:00 AM - 12:00 PM', name: 'Java Programming' }, { time: '12:00 PM - 1:00 PM', name: 'DBMS' }, { time: '2:00 PM - 4:00 PM', name: 'DSA' }],
  Wednesday: [{ time: '9:00 AM - 10:00 AM', name: 'OS' }, { time: '10:00 AM - 11:00 AM', name: 'Computer Networks' }, { time: '11:00 AM - 12:00 PM', name: 'Java Programming' }],
  Thursday: [{ time: '9:00 PM - 10:00 PM', name: 'Java Programming' }, { time: '2:00 PM - 4:00 PM', name: 'DSA' }],
  Friday: [{ time: '10:00 AM - 12:00 PM', name: 'Verbal Ability' }, { time: '12:00 PM - 1:00 PM', name: 'Computer Networks Lab' }]
};
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Makeup'];

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(currentDayName) ? currentDayName : 'Monday');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }));
  }, []);

  useEffect(() => {
    const fetchStats = async () => {

       if (!user?.userId) return; 

     try {
      setError(null);

      const url = `${BASE_API_URL}/api/student/stats/${user.userId}`;

      const res = await axios.get(url, {
          withCredentials: true
      });
        setDashboardData(res.data);
      } catch (err) { 
        console.error("Failed to load stats", err); 
        if (err.response?.status === 403 || err.response?.status === 401) {
            setError("Your session has expired. Please log out and log back in.");
        } else {
            setError("Failed to load dashboard data. Please try again later.");
        }
      } 
      finally { 
        setLoading(false); 
      }
    };
    if (user) fetchStats();
  }, [user]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaThLarge /> },
    { id: 'scanner', label: 'Mark Attendance', icon: <FaQrcode /> },
    { id: 'history', label: 'Overall Attendance', icon: <FaHistory /> },
    { id: 'ai-advisor', label: 'AI Study Advisor', icon: <FaRobot /> },
    { id: 'assessment', label: 'Dynamic Assessment', icon: <FaBrain /> },
    { id: 'profile', label: 'My Profile', icon: <FaUser /> },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-800">

      <Helmet>
          <title>Student Dashboard | SmartPathMaker</title>
          <meta name="description" content="Student dashboard for managing attendance and academic progress." />
      </Helmet>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white transition-transform duration-300 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold mr-3">S</div>
          <h1 className="text-lg font-bold">SALS</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${view === item.id ? "bg-blue-600 shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <span className="mr-3">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800 p-2 rounded transition" onClick={logout}>
           <div><p className="text-sm font-bold">{user?.name || "Student"}</p></div>
           <FaSignOutAlt className="text-red-400" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600"><FaBars size={24} /></button>
           <div className="ml-auto font-bold text-slate-600 uppercase text-sm">{currentDate}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
           {loading ? (
             <div className="flex flex-col items-center justify-center mt-20">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
               <p className="text-slate-500 font-bold">Loading your dashboard...</p>
             </div>
           ) : error ? (
             // FIX: Display Error UI instead of crashing
             <div className="max-w-2xl mx-auto mt-20 bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm text-center">
                <FaExclamationTriangle className="text-4xl mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3>
                <p className="mb-6">{error}</p>
                <button onClick={logout} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition">
                  Log Out & Re-authenticate
                </button>
             </div>
           ) : (
             <>
               {/* --------------------------- MAIN DASHBOARD --------------------------- */}
               {view === 'dashboard' && (
                 <div className="max-w-6xl mx-auto space-y-6">
                    <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name?.split(' ')[0] || 'Student'}! 👋</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       {/* THE TIMETABLE WIDGET */}
                       <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="bg-slate-50 border-b flex overflow-x-auto hide-scrollbar">
                             {DAYS.map(day => (
                                <button key={day} onClick={() => setSelectedDay(day)} className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${selectedDay === day ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:bg-gray-100'}`}>
                                   {day}
                                </button>
                             ))}
                          </div>
                          
                          <div className="p-6">
                             {selectedDay !== 'Makeup' ? (
                                <div className="space-y-4">
                                   {TIMETABLE[selectedDay] ? TIMETABLE[selectedDay].map((cls, i) => (
                                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                         <div>
                                            <p className="font-bold text-slate-800">{cls.name}</p>
                                            <p className="text-xs text-slate-500 flex items-center mt-1"><FaClock className="mr-1"/> {cls.time}</p>
                                         </div>
                                         <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">Scheduled</span>
                                      </div>
                                   )) : <p className="text-slate-400">No classes scheduled.</p>}
                                </div>
                             ) : (
                                // MAKEUP SECTION
                                <div>
                                   <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-4 text-sm flex items-start gap-2 border border-yellow-200">
                                      <FaExclamationTriangle className="mt-0.5" />
                                      <p>Classes created by teachers outside of normal schedule or duplicated today appear here.</p>
                                   </div>
                                   <div className="space-y-4">
                                      {/* FIX: Safe navigation with dashboardData?. */}
                                      {dashboardData?.makeupClassesToday?.length > 0 ? (
                                         dashboardData.makeupClassesToday.map((act, i) => (
                                            <div key={i} className="flex justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                               <div>
                                                  <p className="font-bold text-slate-800">{act.subjectName}</p>
                                                  <p className="text-xs text-slate-400">{act.date}</p>
                                               </div>
                                               <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold self-center">Makeup Attended</span>
                                            </div>
                                         ))
                                      ) : <p className="text-slate-400 text-center">No makeup classes attended today.</p>}
                                   </div>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* QUICK ACTIONS & RECENT (TODAY) */}
                       <div className="space-y-6">
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                             <h3 className="font-bold mb-4">Actions</h3>
                             <button onClick={() => setView('scanner')} className="w-full flex items-center gap-3 p-3 mb-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <FaQrcode /> <span className="font-bold">Mark Attendance</span>
                             </button>
                             <button onClick={() => setView('history')} className="w-full flex items-center gap-3 p-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
                                <FaHistory /> <span className="font-bold">View Full Stats</span>
                             </button>
                          </div>

                          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                             <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wide border-b pb-2 mb-4">Today's Activity</h3>
                             <div className="space-y-3">
                                {/* FIX: Safe navigation with dashboardData?. */}
                                {dashboardData?.recentActivity?.length > 0 ? (
                                   dashboardData.recentActivity.map((act, i) => (
                                      <div key={i} className="flex items-center justify-between">
                                         <div>
                                            <p className="font-semibold text-sm">{act.subjectName}</p>
                                            <p className="text-[10px] text-slate-400">{act.time}</p>
                                         </div>
                                         <FaCheckCircle className="text-green-500" />
                                      </div>
                                   ))
                                ) : <p className="text-xs text-slate-400 text-center">Cleared for the day. No attendance marked yet.</p>}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {/* --------------------------- VIEW: FULL HISTORY & STATS --------------------------- */}
               {view === 'history' && (
                 <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                    <button onClick={() => setView('dashboard')} className="flex items-center text-blue-600 font-bold hover:underline mb-4"><FaChevronRight className="rotate-180 mr-1"/> Back to Dashboard</button>
                    <h2 className="text-2xl font-bold">Overall Attendance Analytics</h2>
                    
                    {/* STAT CARDS - FIX: Pass full class strings instead of partial dynamic names */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                       <StatCard 
                          label="Overall" 
                          value={`${Math.round(dashboardData?.overallPercentage || 0)}%`} 
                          borderColor="border-green-500" 
                          textColor="text-green-600" 
                       />
                       <StatCard 
                          label="Classes This Week" 
                          value={dashboardData?.classesThisWeek || 0} 
                          borderColor="border-blue-500" 
                          textColor="text-blue-600" 
                       />
                       <StatCard 
                          label="Subjects at Risk" 
                          value={dashboardData?.subjectsAtRisk || 0} 
                          borderColor="border-red-500" 
                          textColor="text-red-600" 
                       />
                       <StatCard 
                          label="Current Streak" 
                          value="5 Days" 
                          borderColor="border-orange-500" 
                          textColor="text-orange-600" 
                       />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                       <div className="p-6 border-b bg-slate-50"><h3 className="font-bold">Subject Details</h3></div>
                       <div className="divide-y">
                          {/* FIX: Safe mapping with fallback array */}
                          {(dashboardData?.subjectAttendance || []).map((sub, idx) => (
                             <div key={idx} className="flex items-center justify-between p-6 hover:bg-gray-50">
                                <div>
                                   <h4 className="font-bold text-lg">{sub.subjectName}</h4>
                                   <p className="text-sm text-slate-500 font-mono">{sub.subjectCode}</p>
                                </div>
                                <div className="text-right">
                                   <span className="block text-2xl font-black">{sub.attended} / {sub.total}</span>
                                   <span className="text-xs text-slate-400 uppercase">Classes Attended</span>
                                </div>
                                <div className={`text-xl font-bold px-4 py-2 rounded-lg ${sub.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                   {Math.round(sub.percentage)}%
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {view === 'scanner' && <StudentScanner />}

               {/* PROFILE VIEW */}
               {view === 'profile' && (
                  <div className="max-w-6xl mx-auto">
                     <StudentProfile onBack={() => setView('dashboard')} />
                  </div>
               )}

               {/* ASSESSMENT VIEW */}
               {view === 'assessment' && (
                  <div className="max-w-6xl mx-auto w-full">
                     <StudentAssessment onBack={() => setView('dashboard')} />
                  </div>
               )}

               {/* AI ADVISOR VIEW */}
               {view === 'ai-advisor' && (
                  <div className="max-w-6xl mx-auto">
                     <AILearningPath 
                        onBack={() => setView('dashboard')} 
                        onNavigateToAssessment={() => setView('assessment')} 
                     />
                  </div>
               )}
             </>
           )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, borderColor, textColor }) => (
  <div className={`p-6 rounded-xl border-l-4 ${borderColor} bg-white shadow-sm`}>
     <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
     <h3 className={`text-3xl font-black ${textColor}`}>{value}</h3>
  </div>
);

export default StudentDashboard;