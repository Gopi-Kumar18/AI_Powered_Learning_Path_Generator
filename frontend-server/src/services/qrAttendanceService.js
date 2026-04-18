import axios from 'axios';

axios.defaults.withCredentials = true;

/**
 * 1. Start a New Class Session
 * payload: { subject: "Data Structures", batch: "2024-A" }
 */

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

export const startSession = async (subjectCode, batch) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/api/attendance/create-session`, {
      subjectCode: subjectCode,
      batch: batch
    });
    return response.data; // Returns { sessionId: "DATASTRUCTURES-177..." }
  } catch (error) {
    console.error("Failed to create session", error);
    return null;
  }
};


// ----- 2. Generate QR Token for a Session {payload: { sessionId: "DATASTRUCTURES-177..." } ----- //
export const getQrToken = async (sessionId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/attendance/generate-qr`, {
        params: { sessionId }
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching QR:", error);
    return null;
  }
};


// ----- 3. Mark Attendance with SELFIE {payload: { qrToken, studentId, lat, lng, file } } ----- 
export const markAttendance = async (formData) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/api/attendance/mark`, formData);
    return response.data; 
  } catch (error) {
    console.error("Error marking attendance:", error);
    if (error.response) {
      if (error.response.status === 403 || error.response.status === 401) {
            return { status: "ERROR", message: "Session Expired. Please Login Again." };
        }
        return { status: "ERROR", message: error.response.data.message || "Server Error" };
    }
    return { status: "ERROR", message: "Network Error" };
  }
};


// ----- 4. View Attendance Real Time Logs on teacher dashboard {payload: { sessionId: "DATASTRUCTURES-177..." }} -----
export const getLiveSessionLogs = async (sessionId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/teacher/session-logs/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch live logs", error);
    return { totalPresent: 0, logs: [] };
  }
};


// ----- 5. Fetch all sessions for a teacher (for session history page) {payload: { teacherId: "TEACHER-123..." }} -----
export const getTeacherSessions = async (teacherId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/teacher/sessions/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sessions", error);
    return [];
  }
};


// ----- 6. Fetch analytics data for teacher dashboard analytics page {payload: { teacherId: "TEACHER-123..." }} -----
export const getTeacherAnalytics = async (teacherId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/teacher/analytics/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch analytics", error);
    return null;
  }
};


// ----- 7. Fetch students for a teacher (for analytics page) {payload: { teacherId: "TEACHER-123..." }} -----
export const getTeacherStudents = async (teacherId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/teacher/students/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch students", error);
    return [];
  }
};


// ----- 8. Fetch individual student profile (for manage students page) {payload: { studentId: "12345678" }} -----
export const getStudentProfile = async (studentId) => {
  try {
       const response = await axios.get(`${BASE_API_URL}/api/student/profile/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile", error);
    return null;
  }
};


// ----- 9. Download attendance report as CSV (for session history page) {payload: { sessionId: "DATASTRUCTURES-177..." }} -----
export const downloadAttendanceCSV = async (sessionId) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/teacher/sessions/${sessionId}/export`, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    
  } catch (error) {
    console.error("Failed to download CSV", error);
    alert("Failed to download the attendance report.");
  }
};


// ----- 10. AI QUIZ ASSESSMENT SERVICE + AI LEARNING PATH SERVICES {payload: { studentId: "12345678", subjectId: "1, 2, 3 ...." }} -----
export const generateAIQuiz = async (studentId, subjectCode) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/ai/quiz/generate/${studentId}/${subjectCode}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch AI quiz", error);
    return { status: "ERROR", message: "Failed to connect to the AI service." };
  }
};


// ----- 11. Submit AI Quiz Score {payload: { studentId: "12345678", subjectId: "1, 2, 3 ....", score: 17 }} -----
export const submitQuizScore = async (studentId, subjectCode, score) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/api/ai/quiz/submit`, 
      { studentId, subjectCode, score },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to submit quiz score", error);
    return { status: "ERROR", message: "Failed to submit score." };
  }
};


// ----- 12. Get Comprehensive AI Learning Path (with personalized resources) {payload: { studentId: "12345678", subjectId: "1, 2, 3 ...." }} -----
export const getComprehensiveAILearningPath = async (studentId, subjectCode) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/ai/path/comprehensive/${studentId}/${subjectCode}`);
    return response.data;
  } catch (error) {
    console.error("Failed to generate AI roadmap", error);
    return { status: "ERROR", message: "Failed to generate roadmap." };
  }
};


// ----- 13. Get AI Learning Path (for personalized learning) {payload: { studentId: "12345678", subject: "JAVA PROGRAMMING" }} -----
export const getAILearningPath = async (studentId, subjectCode) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/ai/path/${studentId}/${subjectCode}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch AI path", error);
    return { status: "ERROR" };
  }
};






// // ============================================================
//     // (INTERCEPTORS) - DEBUGGING TOOL FOR ALL REQUESTS/RESPONSES
// // ============================================================

// // axios.interceptors.request.use(request => {
// //   console.log('🚀 [CLIENT SENDING]:', request.method.toUpperCase(), request.url, request.data);
// //   return request;
// // }, error => {
// //   console.error('❌ [CLIENT ERROR]:', error);
// //   return Promise.reject(error);
// // });

// // // Response Detector: Prints what we are receiving
// // axios.interceptors.response.use(response => {
// //   // console.log('✅ [CLIENT RECEIVED]:', response.status, response.data);
// //    console.log('✅ [CLIENT RECEIVED]:', response.status, response.data);
// //   return response;
// // }, error => {
// //   if (error.response) {
// //       console.error('⚠️ [CLIENT FAILED]:', error.response.status, error.response.data);
// //   } else {
// //       console.error('⚠️ [NETWORK ERROR]: Check your IP/Wifi Connection');
// //   }
// //   return Promise.reject(error);
// // });



