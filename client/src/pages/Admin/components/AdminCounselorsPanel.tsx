import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiCLient } from '@/service/app';

export default function AdminCounselorsPanel({ counselors }: { counselors: any[] }) {
  const [deleteDialogue, setDeleteDialogue] = useState<string | null>(null);

  const handleDeleteCounselor = async (counselorId: string) => {
      try {
          const res = await apiCLient.post('/admin/delete-counselor', { counselorId });
          toast.success('Counselor deleted successfully');
          setDeleteDialogue(null);
          setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
          console.error("Error deleting counselor", err);
          toast.error("Failed to delete counselor");
      }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Counselors Directory</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage institutional counselors and view their specializations.</p>
        </div>
        {(!counselors || counselors.length === 0) && (
            <Link
                to="/add-counselor"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-semibold shadow-sm transition-colors whitespace-nowrap"
            >
                + Add Counselor
            </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {(!counselors || counselors.length === 0) ? (
            <div className="p-10 text-center text-gray-500 font-medium bg-gray-50/50">
                No counselors have been added to the system yet.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {counselors.map((c) => (
                    <tr 
                        key={c._id} 
                        className="hover:bg-blue-50/30 transition-colors"
                    >
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {c.counselorId.firstName} {c.counselorId.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{c.counselorId.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {c.specialization?.length ? c.specialization.join(", ") : <span className="text-gray-400 italic">Unspecified</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-bold">
                                {c.yearsOfExperience || 0} yrs
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteDialogue(c._id);
                                }}
                                title="Delete Counselor"
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors"
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

      {/* Delete Counselor Confirmation Modal */}
      {deleteDialogue && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                  <h2 className="text-2xl font-bold mb-3 text-red-600 flex items-center gap-2">
                      <Trash2 size={24} /> Delete Counselor
                  </h2>
                  <div className="mb-6 text-gray-700 bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <p className="font-bold text-red-800 mb-2">Warning: Permanent Action</p>
                      <p className="text-sm">You are about to delete this counselor permanently.</p>
                      <ul className="text-sm list-disc pl-5 mt-3 space-y-1 text-red-700/90 font-medium">
                          <li>Their User account will be deleted</li>
                          <li>Their Counselor profile will be wiped</li>
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
                          onClick={() => handleDeleteCounselor(deleteDialogue)}
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
