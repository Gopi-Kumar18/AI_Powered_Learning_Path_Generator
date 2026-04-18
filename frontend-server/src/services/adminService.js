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
export const uploadSubjectSyllabus = async (subjectCode, file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${BASE_API_URL}/api/admin/subject/${subjectCode}/upload-syllabus`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload syllabus", error);
    return { status: "ERROR", message: "Network error during upload." };
  }
};

// ----- 4. Create a New Subject -----
export const createNewSubject = async (subjectData) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/api/admin/subject/create`, subjectData);
    return response.data;
  } catch (error) {
    console.error("Failed to create subject", error);
    return { 
        status: "ERROR", 
        message: error.response?.data?.message || "Failed to create subject. Check connection." 
    };
  }
};

// ----- 5. Fetch All Subjects -----
export const getAllSubjects = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/api/admin/subjects`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch subjects", error);
    return [];
  }
};