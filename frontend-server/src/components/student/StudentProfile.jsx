import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaIdCard, FaFingerprint, FaShieldAlt, FaKey, FaArrowLeft } from 'react-icons/fa';
import { getStudentProfile } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = ({ onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
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
        
        {/* Left Col: Avatar & Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-5xl font-bold border-4 border-white shadow-lg mb-4">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-slate-500 font-mono mt-1">{profile.studentId}</p>
            
            <div className="mt-6 w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-100 font-medium text-sm">
              <FaFingerprint className="text-lg" />
              Biometrics {profile.biometricStatus}
            </div>
          </div>
        </div>

        {/* Right Col: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">Personal Information</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center text-xl"><FaIdCard /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Registration Number</p>
                  <p className="font-semibold text-slate-800">{profile.studentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center text-xl"><FaEnvelope /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="font-semibold text-slate-800">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center text-xl"><FaShieldAlt /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Account Role</p>
                  <p className="font-semibold text-slate-800 capitalize">{profile.role.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">Account Security</h4>
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl transition-colors border border-transparent hover:border-blue-100 font-medium">
              <div className="flex items-center gap-3">
                <FaKey className="text-lg" /> Change Password
              </div>
              <span className="text-xs bg-white shadow-sm border border-gray-200 px-2 py-1 rounded">Update</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;