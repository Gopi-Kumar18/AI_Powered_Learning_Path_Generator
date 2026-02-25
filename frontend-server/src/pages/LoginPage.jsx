import { use, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaSpinner } from "react-icons/fa";

const LoginPage = () => {

  //   // 1. ADD THIS TEMPORARY EFFECT
  // useEffect(() => {
  //   console.log("Cleaning old tokens...");
  //   localStorage.clear(); // Wipes the bad token
  // }, []);
  
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("https://7fdblmk4-8080.inc1.devtunnels.ms/api/auth/login", {
    //  const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      // 2. Handle Success
      if (data.status === "SUCCESS") {
        login(data); 
        
        // 3. Redirect based on Role
        if (data.role === "TEACHER") {
          navigate("/teacherDashboard");
        } else {
          navigate("/studentDashboard");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server error. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <FaUserShield className="text-5xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">SALS Login</h1>
          <p className="text-gray-400">Smart Attendance Learning System</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">University ID</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Demo Accounts:<br />
            Teacher ID: <strong>27981</strong> / pass123<br />
            Student ID: <strong>12345678</strong> / pass123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;