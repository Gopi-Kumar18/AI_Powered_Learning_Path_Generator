import axios from 'axios';


// ============================================================
    // (INTERCEPTORS) - DEBUGGING TOOL FOR ALL REQUESTS/RESPONSES
// ============================================================

// axios.interceptors.request.use(request => {
//   console.log('🚀 [CLIENT SENDING]:', request.method.toUpperCase(), request.url, request.data);
//   return request;
// }, error => {
//   console.error('❌ [CLIENT ERROR]:', error);
//   return Promise.reject(error);
// });

// // Response Detector: Prints what we are receiving
// axios.interceptors.response.use(response => {
//   // console.log('✅ [CLIENT RECEIVED]:', response.status, response.data);
//    console.log('✅ [CLIENT RECEIVED]:', response.status, response.data);
//   return response;
// }, error => {
//   if (error.response) {
//       console.error('⚠️ [CLIENT FAILED]:', error.response.status, error.response.data);
//   } else {
//       console.error('⚠️ [NETWORK ERROR]: Check your IP/Wifi Connection');
//   }
//   return Promise.reject(error);
// });


const API_URL = 'http://localhost:8080/api/attendance';     //localhost




/**
 * 1. Start a New Class Session
 * payload: { subject: "Data Structures", batch: "2024-A" }
 */

export const startSession = async (subject, batch) => {
  try {
    // This calls the exact endpoint you tested in Postman
    const response = await axios.post(`${API_URL}/create-session`, {
      subject: subject,
      batch: batch
    });
    return response.data; // Returns { sessionId: "DATASTRUCTURES-177..." }
  } catch (error) {
    console.error("Failed to create session", error);
    return null;
  }
};

export const getQrToken = async (sessionId) => {
  try {
    // The backend expects sessionId as a query param

    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/generate-qr`, {
        params: { sessionId }, headers: { Authorization: token ? `Bearer ${token}` : "" }
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching QR:", error);
    return null;
  }
};


/**
 * FEATURE 3: Mark Attendance with SELFIE
 * Payload: FormData { qrToken, studentId, lat, lng, file }
 */

export const markAttendance = async (formData) => {

  const token = localStorage.getItem("token");

    if (!token) {
        return { status: "ERROR", message: "You are not logged in!" };
    }

  try {
    // Note: We do NOT set 'Content-Type': 'multipart/form-data' manually.
    // Axios does it automatically when it sees FormData.
    const response = await axios.post(`${API_URL}/mark`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; 
  } catch (error) {
    console.error("Error marking attendance:", error);
    if (error.response) {
      if (error.response.status === 403) {
            return { status: "ERROR", message: "Session Expired. Please Login Again." };
        }
        return { status: "ERROR", message: error.response.data.message || "Server Error" };
    }
    return { status: "ERROR", message: "Network Error" };
  }
};



