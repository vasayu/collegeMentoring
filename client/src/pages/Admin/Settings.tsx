import SettingsPage from '@/components/SettingsPage';
import { Briefcase, BadgeCheck, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiCLient, GET_USER_ROUTE } from '@/service/app';

export default function Settings() {
  const [workForm, setWorkForm] = useState({
    employeeId: '',
    designation: '',
    department: '',
    address: '',
  });
  const [profileId, setProfileId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiCLient.get(GET_USER_ROUTE);
        const d = res.data.data;
        setProfileId(d?._id || '');
        setWorkForm({
          employeeId:  d?.employeeId || '',
          designation: d?.designation || 'Head of Department',
          department:  d?.adminId?.department || '',
          address:     d?.address || '',
        });
      } catch {}
    })();
  }, []);

  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";
  const fieldClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none";

  const DEPTS = ['IT', 'CSE', 'CSDS', 'ECE', 'EE', 'EEE', 'MECH', 'CIVIL'];

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
            className={fieldClass} placeholder="e.g. Head of Department"
          />
        </div>
        <div>
          <label className={labelClass}>Department</label>
          <select
            value={workForm.department}
            onChange={e => setWorkForm(p => ({ ...p, department: e.target.value }))}
            className={fieldClass}
          >
            <option value="">Select department</option>
            {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}><MapPin className="inline w-3 h-3 mr-1" />Address</label>
          <input
            value={workForm.address}
            onChange={e => setWorkForm(p => ({ ...p, address: e.target.value }))}
            className={fieldClass} placeholder="Your address"
          />
        </div>
      </div>
    </section>
  );

  return (
    <SettingsPage
      title="Account Settings"
      subtitle="Manage your profile information and administrative details."
      workSection={workSection}
      profileUpdateEndpoint={profileId ? `/admin/update-profile/${profileId}` : undefined}
      profileUpdateBody={(form) => ({
        firstName:   form.firstName,
        lastName:    form.lastName,
        email:       form.email,
        department:  workForm.department,
        employeeId:  workForm.employeeId,
        designation: workForm.designation,
        address:     workForm.address,
      })}
    />
  );
}
