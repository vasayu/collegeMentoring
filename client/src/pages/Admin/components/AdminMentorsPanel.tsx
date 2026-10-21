import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PencilIcon, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiCLient } from '@/service/app';

const DEPARTMENTS = ['All', 'IT', 'CSE', 'ECE', 'EE', 'EEE', 'MECH', 'CIVIL'];

interface Props {
  mentors: any[];
  adminDepartment?: string;
  role?: number;
}

export default function AdminMentorsPanel({ mentors, adminDepartment, role }: Props) {
  const navigate = useNavigate();
  const [deleteDialogue, setDeleteDialogue] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const handleDeleteMentor = async (mentorId: string) => {
      try {
          await apiCLient.post('/admin/delete-mentor', { mentorId });
          toast.success('Mentor deleted successfully');
          setDeleteDialogue(null);
          setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
          console.error("Error deleting mentor", err);
          toast.error("Failed to delete mentor");
      }
  };

  // For Master Admin (role 4): show all + allow department filter dropdown
  // For HOD (role 2): only show their department (already filtered from backend)
  let filtered = mentors.filter(m => m.teacherId);

  if (role === 4 && deptFilter !== 'All') {
    filtered = filtered.filter(m => m.teacherId?.department === deptFilter);
  }

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(m =>
      m.teacherId?.firstName?.toLowerCase().includes(q) ||
      m.teacherId?.lastName?.toLowerCase().includes(q) ||
      m.teacherId?.email?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mentors Management</h1>
            <p className="text-gray-500 mt-1 font-medium">
              {role === 4
                ? `Viewing all mentors across all departments.`
                : `View and manage mentors in your department (${adminDepartment || 'N/A'}).`}
            </p>
        </div>
        <Link
          to="/admin/add-mentor"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          + Add Mentor
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {role === 4 && (
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-gray-400 shrink-0" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold appearance-none bg-white"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
              </select>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-medium bg-gray-50/50">
                No mentors found{searchTerm || deptFilter !== 'All' ? ' matching your filters.' : ' in this department.'}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    {role === 4 && <th className="px-6 py-4">Department</th>}
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Designation</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.map((mentor) => (
                    <tr 
                        key={mentor._id} 
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/admin/mentor/${mentor._id}`)}
                    >
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {mentor.teacherId?.firstName} {mentor.teacherId?.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{mentor.teacherId?.email}</td>
                        {role === 4 && (
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                              {mentor.teacherId?.department || '-'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{mentor.specialization?.join(", ") || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-bold leading-none">
                                {mentor.designation || '-'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/mentor/${mentor._id}/edit`);
                            }}
                            title="Edit Mentor"
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialogue(mentor._id);
                            }}
                            title="Delete Mentor"
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors ml-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}

      {/* Delete Mentor Confirmation Modal */}
      {deleteDialogue && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                  <h2 className="text-2xl font-bold mb-3 text-red-600 flex items-center gap-2">
                      <Trash2 size={24} /> Delete Mentor
                  </h2>
                  <div className="mb-6 text-gray-700 bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <p className="font-bold text-red-800 mb-2">Warning: Permanent Action</p>
                      <p className="text-sm">You are about to delete this mentor permanently.</p>
                      <ul className="text-sm list-disc pl-5 mt-3 space-y-1 text-red-700/90 font-medium">
                          <li>Their User account will be deleted</li>
                          <li>Their Teacher profile will be wiped</li>
                          <li>They will be automatically unassigned from any linked classes</li>
                      </ul>
                  </div>
                  <div className="flex justify-end gap-3 font-semibold">
                      <button
                          onClick={() => setDeleteDialogue(null)}
                          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={() => handleDeleteMentor(deleteDialogue)}
                          className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                      >
                          Confirm Delete
                      </button>
                  </div>
              </div>
          </div>
      )}
      </div>
    </div>
  );
}
