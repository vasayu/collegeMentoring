import React, { useState } from 'react';
import { X, Save, User as UserIcon, Mail, Phone, Briefcase, MapPin, Calendar, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiCLient, UPDATE_ADMIN_BY_ID } from '@/service/app';

interface EditAdminModalProps {
  admin: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditAdminModal({ admin, onClose, onUpdate }: EditAdminModalProps) {
  const [formData, setFormData] = useState({
    firstName: admin.adminId?.firstName || '',
    lastName: admin.adminId?.lastName || '',
    email: admin.adminId?.email || '',
    phone: admin.adminId?.phone || '',
    designation: admin.designation || '',
    department: admin.adminId?.department || '',
    gender: admin.adminId?.gender || 'Other',
    dob: (admin.adminId && admin.adminId.dob) ? new Date(admin.adminId.dob).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCLient.patch(`${UPDATE_ADMIN_BY_ID}/${admin._id}`, formData);
      toast.success("Administrator profile updated successfully");
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error("Error updating admin", err);
      toast.error(err.response?.data?.message || "Failed to update administrator");
    } finally {
      setLoading(false);
    }
  };

  const departments = ["IT", "CSE", "ECE", "EE", "EEE", "MECH", "CIVIL"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 lg:p-10 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Administrative Profile</h2>
              <p className="text-sm text-gray-500">Update system administrator credentials and settings.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 text-sm font-bold transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <UserIcon size={12} /> First Name
              </label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Last Name
              </label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Mail size={12} /> Email Address
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Phone size={12} /> Phone Number
              </label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm"
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={12} /> Department
              </label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm appearance-none bg-white"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={12} /> Designation
              </label>
              <input 
                type="text" 
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm"
              />
            </div>

             {/* Gender */}
             <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Heart size={12} /> Gender
              </label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm appearance-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={12} /> Date of Birth
              </label>
              <input 
                type="date" 
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Save size={18} />}
                {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
