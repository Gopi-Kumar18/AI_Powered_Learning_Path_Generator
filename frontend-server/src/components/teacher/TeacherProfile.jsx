import { FaUserCircle, FaEnvelope, FaIdBadge, FaShieldAlt } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

const TeacherProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">

      <Helmet>
          <title>TeacherDashboard | My Profile | SmartPathMaker</title>
          <meta name="description" content="Teacher profile page for managing personal information." />
      </Helmet>
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Cover Photo Area */}
        <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-700 relative">
          <div className="absolute -bottom-16 left-10 w-32 h-32 bg-white rounded-full p-2 shadow-lg">
            <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-5xl font-black text-white">
              {user?.name?.charAt(0) || 'T'}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 px-10 pb-10">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-800">{user?.name || 'Professor Name'}</h2>
            <p className="text-blue-600 font-bold text-lg mt-1 flex items-center gap-2">
              <FaShieldAlt /> Faculty / Instructor
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 text-xl border border-slate-200">
                <FaIdBadge />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teacher ID</p>
                <p className="text-xl font-black text-slate-800 font-mono">{user?.userId || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 text-xl border border-slate-200">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-lg font-bold text-slate-800">{user?.sub || 'teacher@university.edu'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 text-xl border border-slate-200">
                <FaUserCircle />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
                <p className="text-lg font-bold text-slate-800">{user?.role || 'TEACHER'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;