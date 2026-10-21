import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCLient } from "@/service/app";
import { useSelector } from "react-redux";

// ---------- Interfaces ----------
interface Mentor {
  _id: string;
  teacherId: {
    firstName: string;
    lastName?: string;
    email: string;
    department: string;
  };
  employeeId: string;
  specialization: string[];
  designation: string;
  classesHandled: string[];
}

interface FeedbackAnswer {
  questionText: string;
  answer: string;
}
interface FeedbackResponse {
  _id: string;
  student: any | null;
  reflections: string[];
  answers: FeedbackAnswer[];
  subjectCode?: string;
  subjectName?: string;
  createdAt: string;
  success?: boolean;
}

// ---------- Component ----------
const MentorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[] | null>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const mentorRes = await apiCLient.get(`/mentors/view/${id}`);
        console.log(mentorRes.data);
        setMentor(mentorRes.data.data);

        const feedbackRes = await apiCLient.get(`/feedback/responses/${id}`);
        console.log(feedbackRes.data.responses);
        setFeedbacks(feedbackRes.data.responses);
      } catch (error) {
        console.error("Error fetching mentor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading mentor details...</p>;
  }

  if (!mentor) {
    return <p className="text-center mt-10 text-red-500">Mentor not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row bg-white p-8 rounded-2xl shadow-sm border border-gray-100 justify-between items-start mb-10 gap-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-100/50 shadow-sm shrink-0">
            {mentor.teacherId.firstName.charAt(0)}{mentor.teacherId.lastName?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {mentor?.teacherId?.firstName} {mentor?.teacherId?.lastName || ""}
            </h1>
            <p className="text-gray-500 font-medium text-lg mt-1">{mentor?.teacherId?.email}</p>
            
            <div className="flex flex-wrap gap-2 mt-4 text-sm">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                {mentor?.designation || "Mentor"}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg font-bold bg-gray-50 text-gray-700 border border-gray-200">
                {mentor?.teacherId?.department}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg font-bold bg-gray-50 text-gray-700 border border-gray-200">
                ID: {mentor?.employeeId}
              </span>
            </div>

            {mentor?.specialization && mentor.specialization.length > 0 && (
              <p className="mt-4 text-sm text-gray-600">
                <strong className="text-gray-900">Specialization:</strong> {mentor.specialization.join(", ")}
              </p>
            )}

            {/* Classes handled */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Assigned Classes</p>
              <div className="flex flex-wrap gap-3">
                {mentor?.classesHandled?.length === 0 && (
                  <p className="text-gray-500 text-sm font-medium italic">No classes currently assigned.</p>
                )}
                {mentor?.classesHandled?.map((cls, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/class/${cls}`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                  >
                    View Class Detail
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/mentor/${id}/edit`)}
          className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
          Edit Profile
        </button>
      </div>

      {/* Feedback Section */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Student Feedback</h2>

      {feedbacks?.length === 0 ? (
        <div className="p-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">No feedback responses recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks?.map((fb, i) => (
            <div
              key={i}
              className="p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold border border-green-100/50">
                    {fb.student?.studentId?.firstName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {fb.student?.studentId?.firstName} {fb.student?.studentId?.lastName || ""}
                    </p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{fb.student?.studentId?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {fb.subjectName && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 font-bold text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                      {fb.subjectName} ({fb.subjectCode})
                    </div>
                  )}
                  <div className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {fb.answers?.map((ans, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-sm font-medium text-gray-700 leading-relaxed max-w-2xl text-left">
                      <span className="text-gray-400 font-bold mr-2">Q{idx + 1}.</span> 
                      {ans.questionText}
                    </span>
                    <span className="self-start md:self-auto shrink-0 inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm mt-1 md:mt-0">
                      {ans.answer}
                    </span>
                  </div>
                ))}
              </div>

              {fb.reflections?.length > 0 && fb.reflections.some(r => r.trim().length > 0) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="font-bold text-gray-900 text-sm mb-3">Additional Reflections</p>
                  <ul className="space-y-2">
                    {fb.reflections.filter(r => r.trim().length > 0).map((r, j) => (
                      <li key={j} className="text-gray-600 text-sm bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        "{r}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorDetailsPage;
