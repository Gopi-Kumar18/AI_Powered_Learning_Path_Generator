import { useState, useEffect } from 'react';
import { FaUserGraduate, FaArrowLeft, FaSearch, FaCheckCircle, FaClock } from 'react-icons/fa';
import { getTeacherStudents } from '../../services/qrAttendanceService';

const ManageStudents = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getTeacherStudents("TEACHER-001");
      setStudents(data);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm animate-fade-in-up min-h-[500px]">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FaUserGraduate className="text-blue-600" /> Manage Students
          </h2>
          <p className="text-slate-500 mt-2 font-medium">View attendance records for students enrolled in your classes.</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl">
            <FaArrowLeft /> Dashboard
          </button>
        )}
      </div>

      <div className="relative mb-8">
        <FaSearch className="absolute left-4 top-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Student ID (e.g., 12321662)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-10 animate-pulse font-bold">Loading student records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-2xl p-6 transition-all flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center text-xl font-black border border-slate-200 shadow-sm">
                    {student.studentId.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-xl">{student.studentId}</h3>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                      <FaCheckCircle className="text-green-500" /> Biometric Verified
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-slate-200 pt-4 mt-2">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total Attended</p>
                    <p className="text-3xl font-black text-blue-600">{student.totalAttended}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 flex items-center justify-end gap-1">
                      <FaClock /> Last Seen
                    </p>
                    <p className="text-sm font-bold text-slate-600 font-mono">{student.lastSeenDate}</p>
                    <p className="text-xs font-bold text-slate-400 font-mono">{student.lastSeenTime}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 font-bold text-slate-400">
              No students found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;



