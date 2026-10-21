import React, { type FC, useEffect, useState } from "react";
import { apiCLient, QUESTIONS_ROUTE } from "@/service/app";
import { PencilIcon, Trash2 } from "lucide-react";

interface Question {
    _id: string;
    text: string;
    type: "MCQ" | "text" | "rating";
    measure?: "stress" | "mentalability";
    options?: string[];
}

interface Props {
    refreshKey: number;
    onEdit: (q: Question) => void;
}

const QuestionList: FC<Props> = ({ refreshKey, onEdit }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiCLient.get(QUESTIONS_ROUTE);
            setQuestions(res.data?.data ?? res.data);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message ?? "Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [refreshKey]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await apiCLient.delete(`${QUESTIONS_ROUTE}/${id}`);
            fetchQuestions();
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    if (loading) return <div>Loading questions...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-4 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Existing Question Pool ({questions.length})</h3>
            {questions.length === 0 && (
                <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 font-medium">No questions currently match the selected criteria.</p>
                </div>
            )}
            
            <div className="grid gap-4">
                {questions.map((q, index) => (
                    <div key={q._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col sm:flex-row justify-between items-start gap-4 p-5 md:p-6 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                    q.measure === 'stress' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                    {q.measure === 'stress' ? 'Stress Evaluation' : 'Mental Ability'}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                                    {q.type}
                                </span>
                            </div>
                            
                            <p className="text-lg font-bold text-gray-900 leading-snug mb-3">
                                <span className="text-gray-400 mr-2 text-base">{index + 1}.</span>
                                {q.text}
                            </p>

                            {q.type === "MCQ" && q.options && q.options.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {q.options.map((opt, i) => (
                                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100/50">
                                            {String.fromCharCode(65 + i)}. {opt}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex sm:flex-col gap-2 shrink-0">
                            <button
                                onClick={() => onEdit(q)}
                                className="flex items-center justify-center p-2.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all shadow-sm"
                                title="Edit Question"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(q._id)}
                                className="flex items-center justify-center p-2.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all shadow-sm"
                                title="Delete Question"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionList;


