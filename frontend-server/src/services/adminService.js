import axios from 'axios';

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

axios.defaults.withCredentials = true;

// ----- 1. Get Admin Dashboard Stats ------
export const getSystemStats = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/admin/stats`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    return null;
  }
};

// ----- 2. Register New User (Admin Function) ------
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/api/admin/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Failed to register user", error);
    return { status: "ERROR", message: "Registration failed" };
  }
};

// ----- 3. Upload Subject Syllabus (Admin Function) ------
export const uploadSubjectSyllabus = async (subjectId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${BASE_API_URL}/api/admin/subject/${subjectId}/upload-syllabus`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload syllabus", error);
    return { status: "ERROR", message: "Network error during upload." };
  }
};