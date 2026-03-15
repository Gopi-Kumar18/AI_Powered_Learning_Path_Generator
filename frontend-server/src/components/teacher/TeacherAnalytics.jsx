import { useState, useEffect } from 'react';
import { FaChartLine, FaArrowLeft, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { getTeacherAnalytics } from '../../services/qrAttendanceService';

const TeacherAnalytics = ({ onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const result = await getTeacherAnalytics("TEACHER-001");
      setData(result);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center font-bold text-slate-400 py-20 animate-pulse">Gathering Analytics...</div>;
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <FaChartLine className="text-blue-600" /> Attendance Analytics
        </h2>
        {onBack && (
          <button onClick={onBack} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <FaArrowLeft /> Dashboard
          </button>
        )}
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl">
            <FaChalkboardTeacher />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sessions Conducted</p>
            <h3 className="text-5xl font-black text-slate-800">{data?.totalSessions || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Students Marked</p>
            <h3 className="text-5xl font-black text-slate-800">{data?.totalPresent || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8">Average Students per Subject</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.subjectData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748b" tick={{ fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: '#1e293b' }} />
                <Bar dataKey="avgStudents" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8">Daily Attendance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: '#1e293b' }} />
                <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={4} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherAnalytics;



