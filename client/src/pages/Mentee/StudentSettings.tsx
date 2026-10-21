import SettingsPage from '@/components/SettingsPage';
import { GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiCLient, GET_USER_ROUTE } from '@/service/app';

export default function StudentSettings() {
  const [workForm, setWorkForm] = useState({
    admissionNo: '',
    semester: '',
    program: '',
    yearOfAdmission: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiCLient.get(GET_USER_ROUTE);
        const d = res.data.data;
        setWorkForm({
          admissionNo:    d?.admissionNo || '',
          semester:       d?.semester?.toString() || '',
          program:        d?.program || '',
          yearOfAdmission: d?.yearOfAdmission?.toString() || '',
        });
      } catch {}
    })();
  }, []);

  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";
  const fieldClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium";

  const workSection = (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-blue-600" /> Academic Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Admission No.</label>
          <input
            value={workForm.admissionNo}
            disabled
            className={fieldClass + ' opacity-60 cursor-not-allowed'}
            placeholder="Admission number"
          />
        </div>
        <div>
          <label className={labelClass}>Current Semester</label>
          <select
            value={workForm.semester}
            onChange={e => setWorkForm(p => ({ ...p, semester: e.target.value }))}
            className={fieldClass}
          >
            <option value="">Select semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Program</label>
          <select
            value={workForm.program}
            onChange={e => setWorkForm(p => ({ ...p, program: e.target.value }))}
            className={fieldClass}
          >
            <option value="">Select program</option>
            {['BTECH','MTECH','MSC','PHD'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Year of Admission</label>
          <input
            type="number"
            value={workForm.yearOfAdmission}
            onChange={e => setWorkForm(p => ({ ...p, yearOfAdmission: e.target.value }))}
            className={fieldClass}
            placeholder="e.g. 2023"
          />
        </div>
      </div>
    </section>
  );

  return (
    <SettingsPage
      title="Student Settings"
      subtitle="Update your personal information and academic details."
      workSection={workSection}
    />
  );
}
