import { useState } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const SystemAudit = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);

    try {
    //   const response = await fetch('http://localhost:8080/api/admin/trigger-audit', {
    const response = await fetch('https://7fdblmk4-8080.inc1.devtunnels.ms/api/admin/trigger-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      setTimeout(() => {
        setIsAuditing(false);
        if (data.status === 'SUCCESS') {
            setAuditResult({ success: true, count: data.emailsSent });
        } else {
            setAuditResult({ success: false, message: data.message });
        }
      }, 1500);

    } catch (error) {
      setIsAuditing(false);
      setAuditResult({ success: false, message: "Network error. Is the backend running?" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <FaShieldAlt className="text-red-600" /> System Security & Audits
        </h2>
        <p className="text-slate-500 font-medium mt-1">Run manual system checks and dispatch predictive alerts.</p>
      </div>

      {/* The Danger Zone Audit Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-red-50 border-b border-red-100 p-6 flex items-start gap-4">
           <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
              <FaExclamationTriangle className="text-2xl" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-red-900">Danger Zone Predictive Alert Audit</h3>
             <p className="text-red-700/80 text-sm mt-1 max-w-2xl leading-relaxed">
               Running this audit will scan the entire MySQL database for students whose attendance has dropped below the critical 75% threshold. It will automatically compile and dispatch HTML warning emails to those at risk.
             </p>
           </div>
        </div>

        <div className="p-8 flex flex-col items-center justify-center min-h-[250px] bg-slate-50">
           
           {!isAuditing && !auditResult && (
             <button 
               onClick={handleRunAudit}
               className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black tracking-wide shadow-lg shadow-red-500/30 transition-all hover:-translate-y-1 flex items-center gap-3"
             >
               <FaPaperPlane /> Execute System-Wide Audit
             </button>
           )}

           {isAuditing && (
             <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-red-600 font-bold animate-pulse tracking-widest uppercase text-sm">Scanning SALS Database...</p>
             </div>
           )}

           {auditResult && auditResult.success && (
             <div className="text-center animate-fade-in-up">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-slate-800">Audit Complete!</h3>
                <p className="text-slate-600 mt-2 font-medium">Successfully dispatched <span className="font-bold text-blue-600">{auditResult.count}</span> warning emails.</p>
                <button onClick={() => setAuditResult(null)} className="mt-6 text-slate-400 hover:text-slate-600 font-bold text-sm">Run Another Audit</button>
             </div>
           )}

           {auditResult && !auditResult.success && (
             <div className="text-center text-red-600 font-bold">
               <p>Error: {auditResult.message}</p>
               <button onClick={() => setAuditResult(null)} className="mt-4 underline">Try Again</button>
             </div>
           )}

        </div>
      </div>

    </div>
  );
};

export default SystemAudit;