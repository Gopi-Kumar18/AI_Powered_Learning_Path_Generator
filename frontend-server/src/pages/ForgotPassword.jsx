import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const BASE_API_URL = `${import.meta.env.VITE_SPRING_BACKEND_URL}`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Server error. Please try again later.");

      const data = await response.json();
   
      if (data.status === "SUCCESS") {
        setStatus("success");
      } else {
        throw new Error(data.message || "Failed to process request.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Network error. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-800">
      <Helmet>
         <title>Forgot Password | SmartPathMaker</title>
      </Helmet>

      <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-md">
        
        <button onClick={() => navigate("/")} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 mb-6 transition-colors text-sm font-bold">
            <FaArrowLeft /> Back to Login
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h2>
        <p className="text-slate-500 text-sm mb-8">
            Enter your registered email address and we'll send you a link to securely reset your password.
        </p>

        {status === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-start animate-fade-in">
            <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center animate-fade-in">
             <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-green-800 mb-2">Check your inbox</h3>
             <p className="text-sm text-green-700">
                If an account exists for <strong>{email}</strong>, we have sent a password reset link. The link expires in 15 minutes.
             </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-slate-600 font-bold mb-2 text-sm">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                placeholder="john@university.edu"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? <FaSpinner className="animate-spin text-xl" /> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;