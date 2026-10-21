import React, { useEffect, useState } from "react";
import { apiCLient, FEEDBACK_QUESTIONS_ROUTE, GET_STUDENT_SUBJECTS_ROUTE, SUBMIT_FEEDBACK } from "@/service/app";
import { useSelector } from "react-redux";
import { BookOpen, ChevronDown } from "lucide-react";

interface Question {
  _id: string;
  heading?: string;
  questionText: string;
  type: 'MCQ' | 'text';
  options?: string[];
}

interface Subject {
  subjectCode: string;
  subjectName: string;
}

const FeedbackPage: React.FC<{ studentId: string }> = ({ studentId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [questionsRes, subjectsRes] = await Promise.all([
        apiCLient.get(FEEDBACK_QUESTIONS_ROUTE),
        apiCLient.get(GET_STUDENT_SUBJECTS_ROUTE)
      ]);
      
      setQuestions(questionsRes.data.questions);
      setSubjects(subjectsRes.data.subjects);
    } catch (err) {
      console.error("Error loading feedback data:", err);
      setLoadError("Failed to load form details. Please try again later.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubject) {
      alert("Please select a subject before submitting.");
      return;
    }

    try {
      const answers = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer,
        studentId
      }));

      const subject = subjects.find(s => s.subjectCode === selectedSubject);

      await apiCLient.post(SUBMIT_FEEDBACK, { 
        answers, 
        studentId,
        subjectCode: subject?.subjectCode,
        subjectName: subject?.subjectName
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Error submitting feedback!";
      if (msg.includes("E11000") || msg.toLowerCase().includes("duplicate")) {
        alert("You have already submitted feedback for this subject.");
      } else {
        alert(msg);
      }
    }
  };

  if (submitted) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-transparent">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-emerald-50">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback Received!</h2>
          <p className="text-gray-500 max-w-xs mx-auto">Your insights help us improve the learning experience. Thank you!</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700 text-gray-950">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-10 py-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Academic Feedback</h1>
            <p className="text-blue-100 font-medium text-lg max-w-2xl">Help us improve by providing honest feedback about your subjects and instructors.</p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Subject Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Target Subject</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <select
                required
                className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-2xl py-4 pl-12 pr-10 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="" disabled>Select a subject to review...</option>
                {subjects.map((sub) => (
                  <option key={sub.subjectCode} value={sub.subjectCode}>
                    {sub.subjectName} ({sub.subjectCode})
                  </option>
                ))}
                <option value="GENERAL">General/Other Feedback</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Questions Section */}
          <div className="space-y-10">
            {questions.length === 0 && !loadError && (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 font-medium">Preparing evaluation questionnaire...</p>
              </div>
            )}
            
            {loadError && (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-medium text-center">
                {loadError}
              </div>
            )}

            {questions.map((q, i) => (
              <div key={q._id} className="group space-y-4">
                <div className="flex gap-4">
                  <span className="flex-none w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-500 flex items-center justify-center text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    {q.heading && (
                      <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                        {q.heading}
                      </span>
                    )}
                    <p className="font-bold text-gray-800 text-xl leading-snug">{q.questionText}</p>
                  </div>
                </div>

                <div className="pl-12">
                  {q.type === "MCQ" ? (
                    <div className="flex flex-wrap gap-4">
                      {q.options?.map((opt, j) => (
                        <label
                          key={j}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border-2 transition-all font-bold ${
                            responses[q._id] === opt 
                              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                              : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            className="hidden"
                            name={q._id}
                            value={opt}
                            checked={responses[q._id] === opt}
                            onChange={() => handleChange(q._id, opt)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      placeholder="Share your thoughts here..."
                      className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-gray-800 min-h-[120px]"
                      rows={3}
                      value={responses[q._id] || ""}
                      onChange={(e) => handleChange(q._id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={questions.length === 0}
              className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 tracking-tight"
            >
              Submit Subject Feedback
            </button>
            <p className="text-center text-gray-400 font-bold text-sm mt-6 uppercase tracking-widest">
              Submission represents your final response for this subject
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;

