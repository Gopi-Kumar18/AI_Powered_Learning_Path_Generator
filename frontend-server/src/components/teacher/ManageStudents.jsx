import { useState, useEffect } from 'react';
import { FaUserGraduate, FaArrowLeft, FaSearch, FaCheckCircle, FaClock } from 'react-icons/fa';
import { getTeacherStudents } from '../../services/qrAttendanceService';

const ManageStudents = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      // Hardcoded for now; later use the logged-in teacher's ID
      const data = await getTeacherStudents("TEACHER-001");
      setStudents(data);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  // Filter students based on the search bar input
  const filteredStudents = students.filter(s => 
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in-up min-h-[500px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-gray-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaUserGraduate className="text-cyan-500" /> Manage Students
          </h2>
          <p className="text-sm text-gray-400 mt-1">View attendance records for students enrolled in your classes.</p>
        </div>
        <button onClick={onBack} className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 transition bg-gray-800 px-4 py-2 rounded-lg">
          <FaArrowLeft /> Dashboard
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-3.5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search by Student ID (e.g., 12321662)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Student List */}
      {loading ? (
        <div className="text-center text-gray-500 py-10 animate-pulse">Loading student records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <div key={idx} className="bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 rounded-xl p-5 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center justify-center text-xl font-bold border border-cyan-800/50">
                    {student.studentId.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{student.studentId}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <FaCheckCircle className="text-green-500" /> Biometric Verified
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-gray-700/50 pt-4 mt-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Total Attended</p>
                    <p className="text-2xl font-black text-white">{student.totalAttended}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center justify-end gap-1">
                      <FaClock /> Last Seen
                    </p>
                    <p className="text-sm text-gray-300 font-mono">{student.lastSeenDate}</p>
                    <p className="text-xs text-gray-500 font-mono">{student.lastSeenTime}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No students found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;