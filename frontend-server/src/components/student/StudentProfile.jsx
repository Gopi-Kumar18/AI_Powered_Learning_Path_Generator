import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaEnvelope, FaIdCard, FaFingerprint, FaShieldAlt, FaKey, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { getStudentProfile } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';
import ChangePassword from '../../pages/ChangePassword';
const StudentProfile = ({ onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.userId) {
        const data = await getStudentProfile(user.userId);
        if (data && data.status === 'SUCCESS') {
          setProfile(data);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="text-center text-slate-400 py-20 animate-pulse font-bold">Loading Profile...</div>;
  }

  if (!profile) {
    return <div className="text-center text-red-500 py-20 font-bold">Failed to load profile data.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      
      <Helmet>
          <title>My Profile | SmartPathMaker</title>
          <meta name="description" content="Manage your personal information and settings." />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <FaUser className="text-blue-600" /> My Profile
        </h2>
        <button onClick={onBack} className="text-slate-500 hover:text-blue-600 flex items-center gap-2 transition font-medium">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-5xl font-extrabold border-4 border-white shadow-lg mb-4">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-slate-500 font-mono mt-1 text-sm">{profile.studentId}</p>
            
            <div className="mt-6 w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-xl border border-green-100 font-bold text-sm">
              <FaFingerprint className="text-lg" />
              Biometrics {profile.biometricStatus || "Active"}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Info Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h4 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal Information</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center text-xl"><FaIdCard /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Registration Number</p>
                  <p className="font-bold text-slate-800">{profile.studentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center text-xl"><FaEnvelope /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="font-bold text-slate-800">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center text-xl"><FaShieldAlt /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Account Role</p>
                  <p className="font-bold text-slate-800 capitalize">{profile.role.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-all duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
               <h4 className="text-lg font-bold text-slate-800">Account Security</h4>
               {showPasswordForm && (
                  <button onClick={() => setShowPasswordForm(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                     <FaTimes size={18} />
                  </button>
               )}
            </div>

            {!showPasswordForm ? (
               <button 
                 onClick={() => setShowPasswordForm(true)} 
                 className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-2xl transition-all border border-slate-100 hover:border-blue-200 font-bold shadow-sm"
               >
                 <div className="flex items-center gap-3">
                   <FaKey className="text-lg text-slate-400" /> Update Password
                 </div>
                 <span className="text-xs bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500">Edit</span>
               </button>
            ) : (
               <div className="animate-fade-in-up">
                  <ChangePassword />
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;