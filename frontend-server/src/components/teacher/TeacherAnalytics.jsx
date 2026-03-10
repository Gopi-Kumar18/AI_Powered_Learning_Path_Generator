import { useState, useEffect } from 'react';
import { FaChartLine, FaArrowLeft, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { getTeacherAnalytics } from '../../services/qrAttendanceService';

const TeacherAnalytics = ({ onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Hardcoded TEACHER-001 for now
      const result = await getTeacherAnalytics("TEACHER-001");
      setData(result);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 py-20 animate-pulse">Gathering Analytics...</div>;
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FaChartLine className="text-cyan-500" /> Attendance Analytics
        </h2>
        <button onClick={onBack} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 transition">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-6 shadow-lg">
          <div className="w-16 h-16 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-3xl">
            <FaChalkboardTeacher />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Sessions Conducted</p>
            <h3 className="text-4xl font-black text-white">{data?.totalSessions || 0}</h3>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-6 shadow-lg">
          <div className="w-16 h-16 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-3xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Students Marked</p>
            <h3 className="text-4xl font-black text-white">{data?.totalPresent || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart: Avg Attendance per Subject */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-300 mb-6">Average Students per Subject</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.subjectData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="subject" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#1F2937' }} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Bar dataKey="avgStudents" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Daily Trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-300 mb-6">Daily Attendance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherAnalytics;