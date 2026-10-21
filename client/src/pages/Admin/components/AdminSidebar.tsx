import React from 'react';
import { LayoutDashboard, Users, UserCheck, GraduationCap } from 'lucide-react';

export type TabType = 'dashboard' | 'mentors' | 'students' | 'counselors' | 'admins';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  role?: number;
}

export default function AdminSidebar({ activeTab, setActiveTab, role }: Props) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    ...(role === 4 ? [{ id: 'admins', label: 'Admins', icon: <UserCheck size={20} /> }] : []),
    { id: 'mentors', label: 'Mentors', icon: <UserCheck size={20} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    { id: 'counselors', label: 'Counselors', icon: <Users size={20} /> },
  ];

  return (
    <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 md:min-h-screen flex flex-row md:flex-col shrink-0 overflow-x-auto overflow-y-hidden md:overflow-y-auto no-scrollbar pb-2 md:pb-0">
      <div className="p-4 md:p-6 md:pb-2 hidden md:block">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Management</h2>
      </div>
      <nav className="flex-1 px-2 md:px-4 mt-2 md:mt-4 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 items-center md:items-stretch min-w-max md:min-w-0 pt-2 md:pt-0 border-b border-gray-100 md:border-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
            }`}
          >
            {tab.icon}
            <span className="hidden md:block">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
