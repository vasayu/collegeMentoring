// src/pages/admin/AddFeedback.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { apiCLient, FEEDBACK_QUESTIONS_ROUTE, FEEDBACK_QUESTION_BY_ID } from '@/service/app';
import { PencilIcon, Trash2, ArrowLeft } from 'lucide-react';

interface Question {
  _id: string;
  heading?: string;
  questionText: string;
  type: 'MCQ' | 'text';
  options?: string[];
}

const AddFeedback = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionHeading, setNewQuestionHeading] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'MCQ' | 'text'>('MCQ');
  const [newOptions, setNewOptions] = useState(['', '', '', '', '']);
  const [editId, setEditId] = useState<string | null>(null);

  // Fetch all questions
  const loadQuestions = async () => {
    try {
      const res = await apiCLient.get(FEEDBACK_QUESTIONS_ROUTE);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Add or Update question
  const handleSave = async () => {
    try {
      const payload = {
        heading: newQuestionHeading,
        questionText: newQuestionText,
        type: newQuestionType,
        options: newQuestionType === 'MCQ' ? newOptions : [],
      };

      if (editId) {
        await apiCLient.put(FEEDBACK_QUESTION_BY_ID.replace(':id', editId), payload);
        setEditId(null);
      } else {
        await apiCLient.post(FEEDBACK_QUESTIONS_ROUTE, payload);
      }

      setNewQuestionHeading('');
      setNewQuestionText('');
      setNewQuestionType('MCQ');
      setNewOptions(['', '', '', '', '']);
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete question
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await apiCLient.delete(FEEDBACK_QUESTION_BY_ID.replace(':id', id));
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit question
  const handleEdit = (q: Question) => {
    setEditId(q._id);
    setNewQuestionHeading(q.heading || '');
    setNewQuestionText(q.questionText);
    setNewQuestionType(q.type);
    setNewOptions(q.options || ['', '', '', '', '']);
  };

  return (
    <div className="relative min-h-screen bg-gray-50/50 pb-10 pt-20">
      <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white shadow-sm border border-gray-100 z-50"
      >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
      </button>
      
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <div className="mb-8 text-center text-gray-900">
            <h1 className="text-3xl font-bold tracking-tight">Manage Feedback Questions</h1>
            <p className="text-gray-500 mt-2 font-medium">Create or modify questions for student feedback.</p>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editId ? 'Edit Question' : 'Add New Question'}</h2>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Question Heading (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. Instructor Performance"
                        value={newQuestionHeading}
                        onChange={(e) => setNewQuestionHeading(e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Question Text <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="e.g. How would you rate the mentorship program?"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Answer Type</label>
                    <div className="relative">
                        <select
                            value={newQuestionType}
                            onChange={(e) => setNewQuestionType(e.target.value as 'MCQ' | 'text')}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium"
                        >
                            <option value="MCQ">Multiple Choice Question (MCQ)</option>
                            <option value="text">Long Text Response</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                {newQuestionType === 'MCQ' && (
                    <div className="pt-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">MCQ Options (up to 5)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {newOptions.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                        const newArr = [...newOptions];
                                        newArr[idx] = e.target.value;
                                        setNewOptions(newArr);
                                    }}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 mt-2 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-8 flex items-center justify-center py-3 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] transition-all w-full md:w-auto gap-2"
                    >
                        {editId ? (
                            <>
                                <PencilIcon className="w-4 h-4" />
                                Update Question
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                Add Question
                            </>
                        )}
                    </button>
                    {editId && (
                        <button
                            onClick={() => {
                                setEditId(null);
                                setNewQuestionHeading('');
                                setNewQuestionText('');
                                setNewQuestionType('MCQ');
                                setNewOptions(['', '', '', '', '']);
                            }}
                            className="ml-3 px-6 flex items-center justify-center py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none active:scale-[0.98] transition-all w-full md:w-auto"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Questions List */}
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Existing Questions ({questions.length})</h2>
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 font-medium">No questions have been added yet.</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div
                            key={q._id}
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col sm:flex-row justify-between items-start gap-4 p-5 md:p-6 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex-1 min-w-0 pr-4">
                                {q.heading && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-600 mb-2 uppercase tracking-wider mr-2">
                                        {q.heading}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 mb-3 uppercase tracking-wider">
                                    {q.type} Question
                                </span>
                                <p className="text-lg font-bold text-gray-900 leading-snug mb-3">
                                    <span className="text-gray-400 mr-2 text-base">{index + 1}.</span>
                                    {q.questionText}
                                </p>
                                
                                {q.type === 'MCQ' && q.options && q.options.some(opt => opt.trim()) && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {q.options.filter(opt => opt.trim()).map((opt, i) => (
                                            <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100/50">
                                                {String.fromCharCode(65 + i)}. {opt}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex sm:flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => handleEdit(q)}
                                    className="flex items-center justify-center p-2.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all"
                                    title="Edit Question"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(q._id)}
                                    className="flex items-center justify-center p-2.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                                    title="Delete Question"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeedback;
