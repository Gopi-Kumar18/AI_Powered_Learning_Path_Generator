import axios from 'axios';

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;



export const getSystemStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    return null;
  }
};

export const registerUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_API_URL}/api/admin/register`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register user", error);
    return { status: "ERROR", message: "Registration failed" };
  }
};


// -------- Upload syllabus once to DB (for manage subjects page) --------

export const uploadSubjectSyllabus = async (subjectId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_API_URL}/api/admin/subject/${subjectId}/upload-syllabus`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload syllabus", error);
    return { status: "ERROR", message: "Network error during upload." };
  }
};