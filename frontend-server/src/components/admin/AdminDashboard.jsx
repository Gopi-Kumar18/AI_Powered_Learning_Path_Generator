import { useState, useEffect } from 'react';
import { FaUsers, FaChalkboardTeacher, FaServer, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { getSystemStats, registerUser } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { uploadSubjectSyllabus } from '../../services/adminService';



const AdminDashboard = () => {
  const { logout } = useAuth();

  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalSessions: 0 });
  const [formData, setFormData] = useState({ customId: '', name: '', email: '', password: '', role: 'STUDENT' });
  const [message, setMessage] = useState(null);

  // --- New State for Syllabus Upload ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadMessage, setUploadMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

const subjects = [
    
    { id: 1, name: "OS" },
    { id: 2, name: "DSA" },
    { id: 3, name: "OS LAB" },
    { id: 4, name: "Verbal Ability" },
    { id: 5, name: "Java Programming" },
    { id: 6, name: "Computer Networks" },
    
];

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getSystemStats();
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await registerUser(formData);
    setMessage(result);
    if (result.status === 'SUCCESS') {
      setFormData({ customId: '', name: '', email: '', password: '', role: 'STUDENT' }); // Reset form
      const updatedStats = await getSystemStats(); // Refresh stats
      if (updatedStats) setStats(updatedStats);
    }
    setTimeout(() => setMessage(null), 4000);
  };


  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadSubjectId) {
      setUploadMessage({ status: 'ERROR', message: 'Please select a subject and a file.' });
      return;
    }

    setIsUploading(true);
    // Call the service we just created
    const result = await uploadSubjectSyllabus(uploadSubjectId, selectedFile);
    setUploadMessage(result);
    setIsUploading(false);

    if (result.status === 'SUCCESS') {
      setSelectedFile(null);
      // Reset the file input visually
      document.getElementById('syllabus-upload').value = ''; 
    }
    
    setTimeout(() => setUploadMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-slate-800 font-sans p-6 md:p-12">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">SALS Admin Control</h1>
          <p className="text-slate-500">System overview and user management</p>
        </div>
        <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Stats Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl"><FaUsers /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Students</p>
              <h3 className="text-3xl font-black">{stats.totalStudents}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl"><FaChalkboardTeacher /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Teachers</p>
              <h3 className="text-3xl font-black">{stats.totalTeachers}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl"><FaServer /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Sessions Held</p>
              <h3 className="text-3xl font-black">{stats.totalSessions}</h3>
            </div>
          </div>
        </div>

        {/* Right Col: Registration Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
            <FaUserPlus className="text-blue-600" /> Onboard New User
          </h2>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 font-bold text-sm ${message.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.message}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">University ID</label>
              <input type="text" required value={formData.customId} onChange={(e) => setFormData({...formData, customId: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 12321662" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@university.edu" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Temporary Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-2">Assign Role</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-500/30 mt-2">
              Create Account
            </button>
          </form>
        </div>


        {/* --- NEW: Syllabus Upload Card --- */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
            <span className="text-2xl text-purple-600">📄</span> Upload Subject Syllabus (PDF)
          </h2>
          
          {uploadMessage && (
            <div className={`p-4 rounded-lg mb-6 font-bold text-sm ${uploadMessage.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {uploadMessage.message}
            </div>
          )}

          <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-slate-500 mb-2">Select Subject</label>
              <select 
                value={uploadSubjectId} 
                onChange={(e) => setUploadSubjectId(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-slate-700"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-slate-500 mb-2">Syllabus PDF File</label>
              <input 
                type="file" 
                id="syllabus-upload"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isUploading || !selectedFile || !uploadSubjectId}
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg shadow-purple-500/30 whitespace-nowrap"
            >
              {isUploading ? 'Extracting & Saving...' : 'Upload & Parse PDF'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;