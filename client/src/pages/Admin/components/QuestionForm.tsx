import React, { type FC, useEffect, useState } from "react";
import { apiCLient, QUESTIONS_ROUTE } from "@/service/app";

interface QuestionProps {
  question?: {
    _id: string;
    text: string;
    type: "MCQ" | "text" | "rating";
    options?: string[];
    measure?: "stress" | "mentalability";
  } | null;
  onSuccess: () => void;
}

const QuestionForm: FC<QuestionProps> = ({ question = null, onSuccess }) => {
  const [text, setText] = useState(question?.text ?? "");
  const [type, setType] = useState<"MCQ" | "text" | "rating">(question?.type ?? "MCQ");
  const [optionsInput, setOptionsInput] = useState((question?.options ?? []).join(","));
  const [measure, setMeasure] = useState<"stress" | "mentalability">(question?.measure ?? "stress");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(question?.text ?? "");
    setType((question?.type as any) ?? "MCQ");
    setOptionsInput((question?.options ?? []).join(","));
    setMeasure((question?.measure as any) ?? "stress");
    setError(null);
  }, [question]);

  const parseOptions = (s: string) =>
    s.split(",").map((o) => o.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim() || !type || !measure) {
      setError("Text, type and measure are required");
      return;
    }

    const payload: any = { text, type, measure };
    if (type === "MCQ") {
      const opts = parseOptions(optionsInput);
      if (opts.length === 0) {
        setError("MCQ must have at least one option");
        return;
      }
      payload.options = opts;
    }

    setLoading(true);
    try {
      if (question?._id) {
        await apiCLient.put(`${QUESTIONS_ROUTE}/${question._id}`, payload);
      } else {
        await apiCLient.post(QUESTIONS_ROUTE, payload);
      }
      onSuccess();
      setText("");
      setType("MCQ");
      setOptionsInput("");
      setMeasure("stress");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err.message ?? "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{question?._id ? "Edit Question" : "Create New Question"}</h3>
      {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">{error}</div>}

      <div className="space-y-4">
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Question Text <span className="text-red-500">*</span></label>
            <input
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the question here..."
                required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Question Type</label>
                <div className="relative">
                    <select
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                    >
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="text">Long Text Response</option>
                        <option value="rating">Numeric Rating (1-5)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Measurement Category</label>
                <div className="relative">
                    <select
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium"
                        value={measure}
                        onChange={(e) => setMeasure(e.target.value as any)}
                    >
                        <option value="stress">Stress Evaluation</option>
                        <option value="mentalability">Mental Ability Test</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
            </div>
        </div>

        {type === "MCQ" && (
            <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">MCQ Options</label>
            <input
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="Separate options with commas (e.g. Option A, Option B, Option C)"
            />
            <p className="text-xs text-gray-500 mt-1 ml-1">Example: Very Often, Sometimes, Rarely, Never</p>
            </div>
        )}

        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
            <button
            type="submit"
            disabled={loading}
            className="px-8 flex items-center justify-center py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
            {loading ? "Saving..." : question?._id ? "Update Question" : "Add Question to Pool"}
            </button>
        </div>
      </div>
    </form>
  );
};

export default QuestionForm;
