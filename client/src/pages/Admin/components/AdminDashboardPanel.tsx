import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboardPanel({ admin }: { admin: any }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6">
       {/* Welcome Bar */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm gap-4">
           <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                   Welcome back, {admin?.adminId?.firstName}
                   {admin?.adminId?.role === 4 && (
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm ring-1 ring-inset ring-blue-700/10">
                           Master Admin
                       </span>
                   )}
                </h1>
               <p className="text-gray-500 mt-1.5 font-medium">Manage your institution's users and resources here.</p>
           </div>
           <button
               onClick={() => navigate('/admin/create-admin')}
               className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 font-semibold shadow-sm transition-colors tabular-nums whitespace-nowrap"
           >
               + Add Admin
           </button>
       </div>

       {/* Profile Details */}
       <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
               <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
               Admin Profile
           </h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 text-sm">
               <div className="flex flex-col gap-1.5">
                   <span className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Email</span>
                   <span className="font-semibold text-gray-900 text-base">{admin?.adminId?.email || '-'}</span>
               </div>
               <div className="flex flex-col gap-1.5">
                   <span className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Employee ID</span>
                   <span className="font-semibold text-gray-900 text-base">{admin?.employeeId || '-'}</span>
               </div>
               <div className="flex flex-col gap-1.5">
                   <span className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Department</span>
                   <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-800">
                       {admin?.adminId?.department || '-'}
                   </span>
               </div>
               <div className="flex flex-col gap-1.5">
                   <span className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Designation</span>
                   <span className="font-semibold text-gray-900 text-base">{admin?.designation || '-'}</span>
               </div>
               <div className="flex flex-col gap-1.5">
                   <span className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Managed Teachers</span>
                   <span className="font-bold text-blue-700 text-base">{admin?.teachers?.length || 0}</span>
               </div>
               <div className="flex flex-col gap-1.5">
                   <span className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Active Classes</span>
                   <span className="font-bold text-indigo-700 text-base">{admin?.classes?.length || 0}</span>
               </div>
           </div>
       </div>

       {/* Action Cards */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
               <div>
                   <h3 className="font-bold text-lg text-gray-900 mb-2">Academic Stress & Mental Ability</h3>
                   <p className="text-gray-500 text-sm mb-8 leading-relaxed">Configure and manage stress and mental ability assessment tests for students enrolled in the system.</p>
               </div>
               <Link
                   to="/add-mental-ability"
                   className="inline-flex justify-center items-center w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-4 py-3 rounded-xl transition-colors"
               >
                   + Add Test Template
               </Link>
           </div>
           
           <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
               <div>
                   <h3 className="font-bold text-lg text-gray-900 mb-2">Mentor Feedback Form</h3>
                   <p className="text-gray-500 text-sm mb-8 leading-relaxed">Manage and customize the questions used for student feedback regarding their assigned mentors.</p>
               </div>
               <Link
                   to="/add-feedback-questions"
                   className="inline-flex justify-center items-center w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-4 py-3 rounded-xl transition-colors"
               >
                   + Add Feedback Questions
               </Link>
           </div>
       </div>
    </div>
  );
}
