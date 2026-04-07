import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, password }),
      });

      // ---------- 1. Handle HTTP routing/server crashes first  ----------
      if (!response.ok) {
         if (response.status >= 500) {
            throw new Error("The server is currently experiencing issues. Please try again later.");
         } else if (response.status === 404) {
            throw new Error("Authentication service is temporarily unreachable.");
         } else {
            throw new Error(`Unexpected server crash: ${response.status}`);
         }
      }

      const data = await response.json();

      // ---------- 2. Handle Logical Success/Failure based on your Spring Boot response
      if (data.status === "SUCCESS") {
        login(data); 

        if (data.role === "TEACHER") navigate("/teacherDashboard");
        else if (data.role === "STUDENT") navigate("/studentDashboard");
        else if (data.role === "ADMIN") navigate("/adminDashboard");
        else throw new Error("Unrecognized user role assigned to this account.");
        
      } else {
        throw new Error(data.message || "Login failed. Please check your credentials and try again.");
      }

    } catch (err) {
      // ---------- 3. Handle Network Failures (e.g., backend is turned off, CORS issues, or no WiFi)  ----------
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
         setError("Unable to connect to the server. Please ensure you have internet access and the backend is running.");
      } else {
         setError(err.message || "An unexpected error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-800">
      <Helmet>
         <title>Login | SmartPathMaker</title>
         <meta name="description" content="Sign in to your SmartPathMaker account." />
      </Helmet>

      {/* Main Login Card */}
      <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-md">
        
        {/* Header & Logo Integration */}
        <div className="text-center mb-10">
          {/* SVG representation of the SPM Path Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-slate-50 shadow-sm mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" className="w-12 h-12">
               <defs>
                 <linearGradient id="lineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#3b82f6" />
                   <stop offset="100%" stopColor="#8b5cf6" />
                 </linearGradient>
               </defs>
               <path d="M 30 85 L 55 45 L 70 60 L 90 30" fill="none" stroke="url(#lineGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M 65 30 L 90 30 L 90 55" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
               <circle cx="30" cy="85" r="7.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="3"/>
               <circle cx="55" cy="45" r="7.5" fill="#6366f1" stroke="#ffffff" strokeWidth="3"/>
               <circle cx="70" cy="60" r="7.5" fill="#7c3aed" stroke="#ffffff" strokeWidth="3"/>
             </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight">
             <span className="text-slate-900">Smart</span>
             <span className="text-blue-500">Path</span>
             <span className="text-slate-500 font-normal">Maker</span>
          </h1>
          <p className="text-slate-400 text-xs tracking-[0.2em] uppercase mt-2 font-bold">
             AI-Driven Personalized Learning
          </p>
        </div>

        {/* Dynamic Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex items-start animate-fade-in">
            <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* University ID Field */}
          <div>
            <label className="block text-slate-600 font-bold mb-2 text-sm">University ID</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
              placeholder="e.g. 12345678"
            />
          </div>

          {/* Password Field with Eye Toggle */}
          <div>
            <label className="block text-slate-600 font-bold mb-2 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <FaSpinner className="animate-spin text-xl" /> : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="flex justify-center gap-4 text-sm font-medium">
            
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 hover:text-blue-700 transition-colors">

              Forgot Password?

            </button>
        
            <span className="text-slate-300">|</span>
        
            <button
              onClick={() => navigate("/change-password")}
              className="text-purple-600 hover:text-purple-700 transition-colors">

              Change Password
              
            </button>
        
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;