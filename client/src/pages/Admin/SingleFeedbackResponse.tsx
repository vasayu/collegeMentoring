'use client';

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiCLient, SINGLE_FEEDBACK_RESPONSES } from "@/service/app";

interface Answer {
  questionText: string;
  answer: string;
}

interface FeedbackResponse {
  _id: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  answers: Answer[];
  subjectCode?: string;
  subjectName?: string;
}

const FeedbackResponsePage: React.FC = () => {
  const { responseId } = useParams();
  const [response, setResponse] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const url = SINGLE_FEEDBACK_RESPONSES.replace(":responseId", responseId!);
        const res = await apiCLient.get(url);
        setResponse(res.data.response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (responseId) fetchResponse();
  }, [responseId]);

  if (loading) return <p className="p-4">Loading response...</p>;
  if (!response) return <p className="p-4">Response not found.</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <Link to="/feedback-responses" className="text-blue-600 hover:underline">
        ← Back to all feedback
      </Link>

      <div className="bg-white rounded-xl p-6 shadow space-y-4">
        <h2 className="text-2xl font-bold">Student Feedback</h2>
        <p><span className="font-semibold">Name:</span> {response.student.firstName} {response.student.lastName}</p>
        <p><span className="font-semibold">Email:</span> {response.student.email}</p>
        {response.subjectName && (
          <p><span className="font-semibold">Subject:</span> {response.subjectName} ({response.subjectCode})</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Responses</h3>
        {response.answers.map((ans, idx) => (
          <div key={idx} className="p-2 border-b last:border-b-0">
            <p className="font-medium">{idx + 1}. {ans.questionText}</p>
            <p className="text-gray-700 ml-2">{ans.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackResponsePage;

