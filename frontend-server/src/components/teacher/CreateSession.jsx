import { useState } from 'react';
import { startSession } from '../../services/qrAttendanceService.js';

const CreateSession = ({ onSessionStarted }) => {
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
        const mockSessionId = `SESSION-${Math.floor(Math.random() * 1000)}`;
        onSessionStarted(mockSessionId);
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto mt-10 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Start New Class</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input
            type="text"
            required
            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Data Structures"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Section ID</label>
          <input
            type="text"
            required
            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 2024-CS-A"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? 'Creating Session...' : 'Generate QR Code'}
        </button>
      </form>
    </div>
  );
};

export default CreateSession;