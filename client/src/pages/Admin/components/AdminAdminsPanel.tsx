import React, { useState, useEffect } from 'react';
import { PencilIcon, ShieldCheck, Mail, MapPin, Briefcase, Trash2, ShieldPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiCLient, GET_ALL_ADMINS, DELETE_ADMIN, UPDATE_ADMIN_BY_ID } from '@/service/app';
import EditAdminModal from './EditAdminModal.tsx';

export default function AdminAdminsPanel() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [deleteDialogue, setDeleteDialogue] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiCLient.get(GET_ALL_ADMINS);
      setAdmins(res.data.data || []);
    } catch (err) {
      console.error("Error fetching admins", err);
      toast.error("Failed to load administrators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDeleteAdmin = async (id: string) => {
    try {
      await apiCLient.post(DELETE_ADMIN, { adminProfileId: id });
      toast.success("Administrator deleted successfully");
      setDeleteDialogue(null);
      fetchAdmins();
    } catch (err: any) {
      console.error("Error deleting admin", err);
      toast.error(err.response?.data?.message || "Failed to delete administrator");
    }
  };

  const handlePromoteToMaster = async (id: string) => {
    if (!window.confirm("Promote this user to Master Admin (Role 4)? This gives them full access to all departments.")) return;
    try {
        await apiCLient.patch(`${UPDATE_ADMIN_BY_ID}/${id}`, { role: 4 });
        toast.success("User promoted to Master Admin");
        fetchAdmins();
    } catch (err: any) {
        console.error("Error promoting admin", err);
        toast.error(err.response?.data?.message || "Failed to promote user");
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.adminId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.adminId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.adminId?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Management</h1>
                <p className="text-gray-500 mt-1 font-medium">Oversee department HODs and other administrative staff.</p>
            </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Admins:</span>
            <span className="text-sm font-bold text-gray-900">{admins.length}</span>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
            <input 
                type="text" 
                placeholder="Search by name, email or department..." 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {filteredAdmins.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-medium bg-gray-50/50">
                {searchTerm ? "No administrators match your search." : "No administrators found."}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Designation</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredAdmins.map((admin) => (
                    <tr 
                        key={admin._id} 
                        className="hover:bg-blue-50/30 transition-colors group"
                    >
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">{admin.adminId?.firstName || 'Unknown'} {admin.adminId?.lastName || ''}</span>
                                    {admin.adminId?.role === 4 && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-tighter">
                                            Master Admin
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Mail size={12} /> {admin.adminId?.email || 'N/A'}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                {admin.adminId?.department || '-'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-600">{admin.designation || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                {admin.adminId?.role !== 4 && (
                                    <button
                                        onClick={() => handlePromoteToMaster(admin._id)}
                                        className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 transition-colors"
                                        title="Promote to Master Admin"
                                    >
                                        <ShieldPlus className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditingAdmin(admin)}
                                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Edit Profile"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteDialogue(admin._id)}
                                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                                    title="Delete Administrator"
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialogue && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                  <h2 className="text-2xl font-bold mb-3 text-red-600 flex items-center gap-2">
                      <Trash2 size={24} /> Delete Admin
                  </h2>
                  <div className="mb-6 text-gray-700 bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <p className="font-bold text-red-800 mb-2">Warning: Permanent Action</p>
                      <p className="text-sm">You are about to delete this administrator permanently.</p>
                      <ul className="text-sm list-disc pl-5 mt-3 space-y-1 text-red-700/90 font-medium">
                          <li>Their User account will be deleted</li>
                          <li>They will lose all administrative privileges</li>
                          <li>This action cannot be undone</li>
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
                          onClick={() => handleDeleteAdmin(deleteDialogue)}
                          className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                      >
                          Confirm Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {editingAdmin && (
        <EditAdminModal 
            admin={editingAdmin} 
            onClose={() => setEditingAdmin(null)} 
            onUpdate={fetchAdmins}
        />
      )}
    </div>
  );
}
