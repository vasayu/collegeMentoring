import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Search, GraduationCap } from 'lucide-react';
import { apiCLient } from '@/service/app';
import toast from 'react-hot-toast';

interface Props {
    adminDepartment?: string;
    role?: number;
}

export default function AdminStudentsPanel({ adminDepartment, role }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setSearched(true);
        setResults([]);
        try {
            const res = await apiCLient.post("/users/get-student-by-admission-no", { query: searchQuery.trim() });
            setResults(res.data.data || []);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setResults([]);
            } else {
                toast.error("Search failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this student?")) return;
        try {
            await apiCLient.post(`/users/remove-student`, { studentId });
            toast.success("Student deleted successfully.");
            setResults(prev => prev.filter(s => s._id !== studentId));
        } catch {
            toast.error("Failed to delete student.");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Students & Mentees</h1>
                        <p className="text-gray-500 mt-1 font-medium">
                            {role === 4
                                ? "Search students across all departments."
                                : `Search students in your department (${adminDepartment || 'N/A'}).`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Link
                        to="/counselor/alert-students"
                        className="flex-1 sm:flex-none justify-center items-center inline-flex px-5 py-2.5 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors whitespace-nowrap text-sm"
                    >
                        View Alerts
                    </Link>
                    <Link
                        to="/create-student"
                        className="flex-1 sm:flex-none justify-center items-center inline-flex px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap text-sm"
                    >
                        + Add Mentee
                    </Link>
                </div>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-3">
                    SEARCH STUDENT
                    <span className="ml-2 text-xs font-normal text-gray-400 normal-case">
                        by name, email, or admission number
                    </span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            placeholder={role === 4 ? "Search across all departments..." : `Search in ${adminDepartment || 'your'} department...`}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium text-sm"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !searchQuery.trim()}
                        className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm text-sm"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Results */}
                <div className="mt-6">
                    {!searched ? (
                        <div className="py-12 px-6 border-2 border-dashed border-gray-200 rounded-2xl text-center flex flex-col items-center text-gray-400 bg-gray-50/50">
                            <Search className="w-10 h-10 mb-3 text-gray-300" />
                            <span className="font-semibold text-gray-500">Search to find students</span>
                            <span className="text-sm mt-1">
                                {role === 4
                                    ? "Results will include students from all departments."
                                    : `Only students from the ${adminDepartment || 'your'} department will appear.`}
                            </span>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-10 text-center text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-200">
                            No students found for <strong>"{searchQuery}"</strong>
                            {role === 2 && <span className="block text-xs mt-1 text-gray-400">Remember: search is limited to the {adminDepartment} department.</span>}
                        </div>
                    ) : (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {results.length} result{results.length !== 1 ? 's' : ''} found
                                </span>
                                {role === 2 && (
                                    <span className="text-xs text-gray-400 font-medium">{adminDepartment} dept. only</span>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left bg-white whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            {role === 4 && <th className="px-6 py-4">Department</th>}
                                            <th className="px-6 py-4">Semester</th>
                                            <th className="px-6 py-4">Admission No.</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {results.map((s: any) => (
                                            <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    {s.student?.firstName} {s.student?.lastName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{s.student?.email}</td>
                                                {role === 4 && (
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                            {s.student?.department || '-'}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                                                        Sem {s.semester || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono font-bold text-gray-700">{s.admissionNo}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/student/${s?.student?._id}`}
                                                            className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold transition-all text-xs shadow-sm"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(s._id)}
                                                            title="Delete Student"
                                                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
