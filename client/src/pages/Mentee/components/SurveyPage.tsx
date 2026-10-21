import React, { useEffect, useState } from "react";
import { apiCLient, STUDENT_QUESTIONS_ROUTE, SUBMIT_SURVEY_ROUTE } from "@/service/app";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Question {
    _id: string;
    text: string;
    type: "MCQ" | "text" | "rating";
    measure?: "stress" | "mentalability";
    options?: string[];
}

const defaultOptions = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const optionToScore: any = {
    "Strongly Disagree": 1,
    "Disagree": 2,
    "Neutral": 3,
    "Agree": 4,
    "Strongly Agree": 5
};

const SurveyPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await apiCLient.get(STUDENT_QUESTIONS_ROUTE);
                setQuestions(res.data?.data ?? res.data);
            } catch (err) {
                setError("Failed to load questions");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);
    const handleChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };
    const calculateMetrics = () => {
        let stressTotal = 0, stressCount = 0, mentalTotals = { logical: 0, memory: 0, learning: 0, concentration: 0, creativity: 0, }, mentalCount = 0;
        questions.forEach((q) => {
            const value = optionToScore[answers[`${q._id}`]] || 0;
            if (q.measure === "stress") {
                stressTotal += value;
                stressCount++;
            } else if (q.measure === "mentalability") {
                mentalCount++;
                if (/logical|analyze|reason/i.test(q.text)) mentalTotals.logical += value;
                else if (/memory|remember/i.test(q.text)) mentalTotals.memory += value;
                else if (/learn|technical|concept/i.test(q.text)) mentalTotals.learning += value;
                else if (/focus|concentrate|distract/i.test(q.text)) mentalTotals.concentration += value;
                else if (/visualize|connect|creativity|design/i.test(q.text)) mentalTotals.creativity += value;
            }
        });
        const stressIndex = stressCount ? +(stressTotal / stressCount).toFixed(2) : 0;
        const mentalAbility = {
            logical: +(mentalTotals.logical / (mentalCount / 5)).toFixed(2) || 0,
            memory: +(mentalTotals.memory / (mentalCount / 5)).toFixed(2) || 0,
            learning: +(mentalTotals.learning / (mentalCount / 5)).toFixed(2) || 0,
            concentration: +(mentalTotals.concentration / (mentalCount / 5)).toFixed(2) || 0,
            creativity: +(mentalTotals.creativity / (mentalCount / 5)).toFixed(2) || 0,
        };
        return { stressIndex, mentalAbility };
    };
    const academicStressQuestions = questions.filter(q => q.measure === "stress");
    const mentalAbilityQuestions = questions.filter(q => q.measure === "mentalability");

    const handleSubmit = async () => {
        try {
            const payload = calculateMetrics();
            await apiCLient.post(SUBMIT_SURVEY_ROUTE, payload);
            setAnswers({});
            
            const userDataStr = localStorage.getItem("userData");
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            
            toast.success("Submitted successfully!");
            if (userData?._id) {
                navigate(".", { replace: true });
            } else {
               navigate("/student"); 
            }
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to submit survey");
        } 
    };

    if (loading) return <div>Loading questions...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="min-h-screen  p-6 relative">
            <div className=" mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold mb-8">
                    Academic Stress & Mental Ability Survey
                </h1>
                <section className="mb-8 ml-2">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Academic Stress</h2>
                    {academicStressQuestions.map((q, idx) => (
                        <div key={q._id} className="mb-4 ml-2">
                            <p className="font-medium">{idx + 1}. {q.text}</p>
                            <div className="mt-2">
                                {q.type === "text" ? (
                                    <textarea
                                        value={answers[`${q._id}`] || ""}
                                        onChange={(e) => handleChange(q._id, e.target.value)}
                                        className="border rounded p-2 w-full"
                                        rows={2}
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-4">
                                        {(q.options?.length ? q.options : defaultOptions).map(option => (
                                            <label key={option} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`${q._id}`}
                                                    value={option}
                                                    checked={answers[`${q._id}`] === option}
                                                    onChange={(e) => handleChange(q._id, e.target.value)}
                                                    className="accent-indigo-600"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </section>
                <section className="mb-8 ml-2 ">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Self-Assessment of Mental Ability</h2>
                    {mentalAbilityQuestions.map((q, idx) => (
                        <div key={q._id} className="mb-4 ml-2 ">
                            <p className="font-medium">{idx + 1}. {q.text}</p>
                            <div className="mt-2">
                                {q.type === "text" ? (
                                    <textarea
                                        value={answers[`${q._id}`] || ""}
                                        onChange={(e) => handleChange(q._id, e.target.value)}
                                        className="border rounded p-2 w-full"
                                        rows={2}
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-4">
                                        {(q.options?.length ? q.options : defaultOptions).map(option => (
                                            <label key={option} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`${q._id}`}
                                                    value={option}
                                                    checked={answers[`${q._id}`] === option}
                                                    onChange={(e) => handleChange(q._id, e.target.value)}
                                                    className="accent-indigo-600"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </section>

                <div className="text-center">
                    <button
                        className="bg-indigo-600 text-white px-12 py-3 mx-auto rounded-md hover:bg-indigo-700 transition"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveyPage;


