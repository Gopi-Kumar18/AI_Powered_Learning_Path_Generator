import { useState } from 'react';
import { FaBrain, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaPlay } from 'react-icons/fa';
import { generateAIQuiz, submitQuizScore, getComprehensiveAILearningPath } from '../../services/qrAttendanceService';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const StudentAssessment = ({ onBack }) => {
  const { user } = useAuth();
  

    const subjects = [
    { id: 1, name: "OS" },
    { id: 2, name: "DSA" },
    { id: 3, name: "OS LAB" },
    { id: 4, name: "Verbal Ability" },
    { id: 5, name: "Java Programming" },
    { id: 6, name: "Computer Networks" },
  ];

  const [selectedSubject, setSelectedSubject] = useState('');
  const [quizState, setQuizState] = useState('SETUP'); 
  const [quizData, setQuizData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [finalRoadmap, setFinalRoadmap] = useState(null);

  const startQuiz = async () => {
    if (!selectedSubject) return;
    setQuizState('LOADING');

    const result = await generateAIQuiz(user.userId, selectedSubject);
    
    if (result.status === 'SUCCESS') {
      try {
        const parsedQuiz = JSON.parse(result.quizData);
        setQuizData(parsedQuiz);
        setQuizState('ACTIVE');
      } catch (err) {
        alert("AI generated invalid quiz data. Please try again.");
        setQuizState('SETUP');
      }
    } else {
      alert(result.message || "Failed to generate quiz.");
      setQuizState('SETUP');
    }
  };


  const handleSelectOption = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: option });
  };


const submitQuiz = async () => {
    let finalScore = 0;
    
    quizData.forEach((q, index) => {
      const selected = selectedAnswers[index];
      const correct = q.correctAnswer;

      if (selected && correct) {
        const cleanSelected = String(selected).trim().toLowerCase();
        const cleanCorrect = String(correct).trim().toLowerCase();

        if (
          cleanSelected === cleanCorrect || 
          cleanSelected.includes(cleanCorrect) || 
          cleanCorrect.includes(cleanSelected)
        ) {
          finalScore += 1;
        }
        //  else {
        //   // Optional: Helpful for debugging! You can look in your browser console (F12) 
        //   // to see exactly what Gemini generated vs what you clicked.
        //   console.log(`Mismatch at Q${index + 1} -> Selected: "${selected}" | AI Expected: "${correct}"`);
        // }
      }
    });
    
    setScore(finalScore);

    await submitQuizScore(user.userId, selectedSubject, finalScore);

    setQuizState('FINISHED');
  };


 const handleGenerateRoadmap = async () => {
    setQuizState('LOADING_ROADMAP');
    
    const result = await getComprehensiveAILearningPath(user.userId, selectedSubject);
    
    if (result.status === 'SUCCESS') {
      setFinalRoadmap(result.roadmap);
      setQuizState('SHOW_ROADMAP');
    } else {
      alert(result.message || "Failed to generate roadmap. Please try again.");
      setQuizState('FINISHED'); 
    }
  };


  // --- RENDERING VIEWS ---

  if (quizState === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6 animate-pulse">
        <FaBrain className="text-6xl text-purple-600 animate-bounce" />
        <h3 className="text-2xl font-bold text-slate-800">Generating Assessment...</h3>
        <p className="text-slate-500">Analyzing your attendance and reading the syllabus.</p>
      </div>
    );
  }


  if (quizState === 'FINISHED') {
    const percentage = (score / quizData.length) * 100;
    return (
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in-up">
        <h2 className="text-4xl font-black text-slate-800 mb-4">Assessment Complete!</h2>
        <div className="w-40 h-40 mx-auto rounded-full flex items-center justify-center text-5xl font-bold border-8 mb-8 shadow-lg
          ${percentage >= 75 ? 'border-green-400 text-green-600 bg-green-50' : 'border-orange-400 text-orange-600 bg-orange-50'}">
          {score}/{quizData.length}
        </div>
        <p className="text-lg text-slate-600 mb-8 font-medium">
          {percentage >= 75 ? "Excellent work! You have a solid grasp of these concepts." : "You might need to review some core fundamentals. Let's get an AI roadmap."}
        </p>
        <button onClick={handleGenerateRoadmap} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform w-full">
          Generate Final Learning Path
        </button>
      </div>
    );
  }

  if (quizState === 'LOADING_ROADMAP') {
    return <div className="text-center py-20 font-bold text-xl animate-pulse">Merging Attendance & Score... Crafting your Master Plan... 🚀</div>;
  }

  if (quizState === 'SHOW_ROADMAP') {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
        <div className="prose prose-slate max-w-none prose-headings:text-purple-900 prose-a:text-purple-600">
           <ReactMarkdown>{finalRoadmap}</ReactMarkdown>
        </div>
      </div>
    );
  }

  if (quizState === 'ACTIVE') {
    const question = quizData[currentIndex];
    const progress = ((currentIndex + 1) / quizData.length) * 100;

    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-sm">Question {currentIndex + 1} of {quizData.length}</span>
          <button onClick={() => setQuizState('SETUP')} className="text-red-500 font-bold text-sm hover:underline">Quit Exam</button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">

        <div className="prose prose-lg max-w-none mb-8 prose-p:font-bold prose-p:text-slate-800 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:p-5 prose-pre:rounded-xl prose-code:text-purple-600 prose-code:font-mono prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown>{question.question}</ReactMarkdown>
        </div>

          {/* <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">{question.question}</h3> */}
          
          <div className="space-y-4">
            {question.options.map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-lg
                  ${selectedAnswers[currentIndex] === opt 
                    ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-md' 
                    : 'border-slate-200 hover:border-purple-300 text-slate-700 hover:bg-slate-50'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="px-6 py-3 font-bold text-slate-500 disabled:opacity-30 hover:text-purple-600 transition"
            >
              Previous
            </button>
            
            {currentIndex === quizData.length - 1 ? (
              <button 
                onClick={submitQuiz}
                disabled={!selectedAnswers[currentIndex]}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-colors"
              >
                Submit Assessment
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIndex(currentIndex + 1)}
                disabled={!selectedAnswers[currentIndex]}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: SETUP
  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <FaBrain className="text-purple-600" /> Dynamic Assessment
          </h2>
          <p className="text-slate-500 mt-1">Take a custom quiz based on your attendance tier.</p>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-purple-600 flex items-center gap-2 transition font-bold">
          <FaArrowLeft /> Dashboard
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Select Subject</label>
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full border-2 border-slate-200 rounded-xl p-4 focus:border-purple-500 outline-none font-bold text-slate-700 bg-slate-50 mb-8"
        >
          <option value="">-- Choose a Subject --</option>
          {subjects.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
        
        <button 
          onClick={startQuiz}
          disabled={!selectedSubject}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl shadow-xl shadow-purple-500/30 transition flex items-center justify-center gap-3"
        >
          <FaPlay /> Start Evaluation
        </button>
      </div>
    </div>
  );
};

export default StudentAssessment;