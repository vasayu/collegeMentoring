import SettingsPage from '@/components/SettingsPage';
import { Briefcase, BadgeCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiCLient, GET_USER_ROUTE } from '@/service/app';

export default function MentorSettings() {
  const [workForm, setWorkForm] = useState({
    employeeId: '',
    designation: '',
    specialization: '',
    yearsOfExperience: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiCLient.get(GET_USER_ROUTE);
        const d = res.data.data;
        setWorkForm({
          employeeId:       d?.employeeId || '',
          designation:      d?.designation || '',
          specialization:   d?.specialization?.join(', ') || '',
          yearsOfExperience: d?.yearsOfExperience?.toString() || '',
        });
      } catch {}
    })();
  }, []);

  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";
  const fieldClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium";

  const workSection = (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-blue-600" /> Work Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}><BadgeCheck className="inline w-3 h-3 mr-1" />Employee ID</label>
          <input
            value={workForm.employeeId}
            onChange={e => setWorkForm(p => ({ ...p, employeeId: e.target.value }))}
            className={fieldClass} placeholder="Employee ID"
          />
        </div>
        <div>
          <label className={labelClass}>Designation</label>
          <input
            value={workForm.designation}
            onChange={e => setWorkForm(p => ({ ...p, designation: e.target.value }))}
            className={fieldClass} placeholder="e.g. Assistant Professor"
          />
        </div>
        <div>
          <label className={labelClass}>Specialization (comma-separated)</label>
          <input
            value={workForm.specialization}
            onChange={e => setWorkForm(p => ({ ...p, specialization: e.target.value }))}
            className={fieldClass} placeholder="e.g. AI, ML, Data Science"
          />
        </div>
        <div>
          <label className={labelClass}>Years of Experience</label>
          <input
            type="number"
            value={workForm.yearsOfExperience}
            onChange={e => setWorkForm(p => ({ ...p, yearsOfExperience: e.target.value }))}
            className={fieldClass} placeholder="e.g. 5"
          />
        </div>
      </div>
    </section>
  );

  return (
    <SettingsPage
      title="Mentor Settings"
      subtitle="Update your personal information and profile details."
      workSection={workSection}
      profileUpdateEndpoint="/mentors/update"
      profileUpdateBody={(form) => ({
        id: undefined, // handled by middleware via req.user
        updates: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          employeeId: workForm.employeeId,
          designation: workForm.designation,
          specialization: workForm.specialization.split(',').map((s: string) => s.trim()).filter(Boolean),
          yearsOfExperience: Number(workForm.yearsOfExperience) || undefined,
        },
      })}
    />
  );
}
