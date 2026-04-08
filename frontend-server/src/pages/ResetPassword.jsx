import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSpinner, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extracts ?token=... from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  // Safety check: If they land here without a token, throw an error immediately.
  useEffect(() => {
     if (!token) {
        setStatus("error");
        setErrorMessage("Invalid or missing reset token. Please request a new password reset link.");
     }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
       setStatus("error");
       setErrorMessage("Passwords do not match.");
       return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setStatus("success");
      } else {
        throw new Error(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-800">
      <Helmet>
         <title>Create New Password | SmartPathMaker</title>
      </Helmet>

      <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-md">
        
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Create New Password</h2>
        <p className="text-slate-500 text-sm mb-8">
            Your new password must be different from previous used passwords.
        </p>

        {status === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-start animate-fade-in">
            <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {status === "success" ? (
          <div className="text-center animate-fade-in">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                 <FaCheckCircle className="text-3xl text-green-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h3>
             <p className="text-sm text-slate-500 mb-8">Your password has been changed successfully. You can now log in with your new credentials.</p>
             <button
                onClick={() => navigate("/")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
              >
                Return to Login
              </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            
            {/* New Password Field */}
            <div>
              <label className="block text-slate-600 font-bold mb-2 text-sm">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!token}
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-slate-600 font-bold mb-2 text-sm">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={!token}
                minLength="6"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !token}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? <FaSpinner className="animate-spin text-xl" /> : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;