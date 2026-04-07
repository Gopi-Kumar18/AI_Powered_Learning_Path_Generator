import { FaQrcode, FaChartPie, FaUserGraduate, FaCalendarCheck } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';


const TeacherHome = ({ onViewChange }) => {
  const { user } = useAuth();

  const quickActions = [
    { id: 'start-session', title: 'Start New Session', desc: 'Generate a QR code for your current class.', icon: <FaQrcode />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300' },
    { id: 'manage-students', title: 'Manage Students', desc: 'View individual student attendance records.', icon: <FaUserGraduate />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-300' },
    { id: 'analytics', title: 'View Analytics', desc: 'Analyze attendance trends across all subjects.', icon: <FaChartPie />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-300' },
    { id: 'history', title: 'Session History', desc: 'Export CSV reports for previous classes.', icon: <FaCalendarCheck />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">

      <Helmet>
          <title>TeacherDB | Teacher Home Page | SmartPathMaker</title>
          <meta name="description" content="Teacher dashboard for managing the teacher's classes and students." />
      </Helmet>
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2">Welcome back, {user?.name || 'Professor'}! 👋</h1>
          <p className="text-blue-100 text-lg font-medium max-w-xl">
            Your Smart Attendance Learning System is ready. What would you like to do today?
          </p>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-40 -mb-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onViewChange(action.id)}
              className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md text-left flex items-start gap-6 group ${action.border}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                {action.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TeacherHome;