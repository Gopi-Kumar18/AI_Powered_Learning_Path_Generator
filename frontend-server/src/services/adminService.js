import axios from 'axios';

// const API_URL = 'http://localhost:8080/api/admin';

const API_URL = 'https://7fdblmk4-8080.inc1.devtunnels.ms/api/admin';

export const getSystemStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/stats`, {
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
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register user", error);
    return { status: "ERROR", message: "Registration failed" };
  }
};