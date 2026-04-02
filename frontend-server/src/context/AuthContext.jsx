import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sals_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('sals_user', JSON.stringify(userData));
  };


  const logout = async() => {
    try {
      await axios.post(`${import.meta.env.VITE_SPRING_BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true 
      });
    } catch (err) {
      console.error("Failed to log out from server", err);
    }
    setUser(null);
    localStorage.removeItem('sals_user');
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);