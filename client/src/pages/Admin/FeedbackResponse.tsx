import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiCLient, FEEDBACK_RESPONSES, SINGLE_FEEDBACK_RESPONSES } from "@/service/app";

interface Answer {
    questionText: string;
    answer: string;
}

interface FeedbackResponse {
    _id: string;
    student: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    answers: Answer[];
    subjectCode?: string;
    subjectName?: string;
}

const FeedbackResponsePage: React.FC = () => {
    const { responseId } = useParams(); // Get responseId from URL
    const [responses, setResponses] = useState<FeedbackResponse[] | null>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponse = async () => {
            try {
                const res = await apiCLient.get(FEEDBACK_RESPONSES);
                console.log("res", res);
                setResponses(res.data.responses);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResponse();
    }, [responseId]);

    if (loading) {
        return (
            <div className="p-4">
                <p>Loading response...</p>
            </div>
        );
    }
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Feedback Responses</h2>
                    <p className="text-gray-500 mt-1 font-medium">Review the feedback submitted by students below.</p>
                </div>
            </div>

            {responses && responses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {responses.map((response) => (
                        <div
                            key={response.student._id}
                            className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl mb-4 group-hover:scale-105 transition-transform border border-blue-100/50">
                                    {response.student.firstName.charAt(0)}{response.student.lastName?.charAt(0)}
                                </div>
                                <p className="text-lg font-bold text-gray-900 leading-tight">
                                    {response.student.firstName} {response.student.lastName}
                                </p>
                                <p className="text-sm font-medium text-gray-500 mt-1">{response.student.email}</p>
                                
                                {response.subjectName && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100/50">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                                        {response.subjectName}
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm font-medium text-gray-400">
                                <span>ID: {response.student._id.slice(-6).toUpperCase()}</span>
                                <span className="text-blue-600 flex items-center gap-1 group-hover:underline cursor-pointer">
                                    View full
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">No responses yet</p>
                    <p className="text-gray-500 mt-1">When students submit feedback, it will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default FeedbackResponsePage;

