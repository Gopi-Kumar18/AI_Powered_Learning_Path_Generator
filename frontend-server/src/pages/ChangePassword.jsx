import { useState } from "react";
import axios from "axios";
import { FaSpinner, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (newPassword !== confirmPassword) {
       setStatus("error");
       setErrorMessage("New passwords do not match.");
       return;
    }
    if (newPassword === currentPassword) {
       setStatus("error");
       setErrorMessage("Your new password cannot be the same as your current password.");
       return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await axios.post(`${BASE_API_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      }, { withCredentials: true });

      if (response.data.status === "SUCCESS") {
        setStatus("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setStatus("idle"), 3000); 
      } else {
        throw new Error(response.data.message || "Failed to update password.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm w-full max-w-md">

      <Helmet>
          <title>Change Password | SmartPathMaker</title>
          <meta name="description" content="Take a custom assessment based on your attendance tier." />
      </Helmet>

      <h2 className="text-xl font-bold text-slate-900 mb-2">Change Password</h2>
      <p className="text-slate-500 text-sm mb-6">Update your password to keep your account secure.</p>

      {status === "error" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 rounded-r-lg flex items-start animate-fade-in">
          <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-6 rounded-r-lg flex items-center animate-fade-in">
          <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0 text-lg" />
          <p className="text-sm text-green-700 font-medium">Password successfully updated!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Current Password Field */}
        <div>
          <label className="block text-slate-600 font-bold mb-2 text-sm">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div>
          <label className="block text-slate-600 font-bold mb-2 text-sm">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              minLength="6"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label className="block text-slate-600 font-bold mb-2 text-sm">Confirm New Password</label>
          <input
            type={showNew ? "text" : "password"}
            required
            minLength="6"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === "loading" ? <FaSpinner className="animate-spin" /> : "Save New Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;