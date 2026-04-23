import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaChartLine, FaArrowLeft, FaChalkboardTeacher, FaUsers, FaGraduationCap } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { getTeacherAnalytics } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';

const TeacherAnalytics = ({ onBack }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [timeRange, setTimeRange] = useState('daily'); 

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !user.userId) return;
      const result = await getTeacherAnalytics(user.userId);
      setData(result);
      setLoading(false);
    };
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="text-center font-bold text-slate-400 py-20 animate-pulse">Gathering Analytics...</div>;
  }

  const marksData = [
    { name: 'Passed (>1)', value: data?.marks?.passed || 0 },
    { name: 'Failed (<=1)', value: data?.marks?.failed || 0 },
  ];
  const PIE_COLORS = ['#10b981', '#ef4444']; // Emerald Green for Pass, Red for Fail

  const totalQuizzes = (data?.marks?.passed || 0) + (data?.marks?.failed || 0);

  return (
    <div className="animate-fade-in-up space-y-8">
      <Helmet>
          <title>Teacher Analytics | SmartPathMaker</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FaChartLine className="text-blue-600" /> Class Analytics
            </h2>
            <p className="text-slate-500 font-bold mt-1 tracking-wide uppercase text-sm">
                Subject: <span className="text-blue-600">{data?.subjectName || 'Loading...'}</span>
            </p>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
            <FaArrowLeft /> Dashboard
          </button>
        )}
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
            <FaChalkboardTeacher />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sessions</p>
            <h3 className="text-4xl font-black text-slate-800">{data?.totalSessions || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Attendance</p>
            <h3 className="text-4xl font-black text-slate-800">{data?.totalPresent || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
            <FaGraduationCap />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Assessments</p>
            <h3 className="text-4xl font-black text-slate-800">{totalQuizzes}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* GRAPH A: ATTENDANCE TRENDS */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-xl font-black text-slate-800">Attendance Trends</h3>
              
              {/* Segmented Control for Time Range */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['daily', 'weekly', 'monthly'].map((range) => (
                      <button 
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all ${
                              timeRange === range 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                          {range}
                      </button>
                  ))}
              </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={data?.attendance?.[timeRange] || []}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH B: AI ASSESSMENT MARKS */}
        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-2">AI Assessment Results</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Based on Dynamic Quizzes (Score &gt;1 is Pass)</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {totalQuizzes === 0 ? (
                <div className="text-center text-slate-400 font-bold p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full">
                    No assessments taken yet.
                </div>
            ) : (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={marksData}
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {marksData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                                itemStyle={{ color: '#1e293b' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '14px', color: '#475569' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherAnalytics;