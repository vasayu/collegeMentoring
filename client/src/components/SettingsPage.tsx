import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, Briefcase, Mail, Phone, Calendar,
  KeyRound, Eye, EyeOff, ShieldCheck, Save
} from 'lucide-react';
import { apiCLient, GET_USER_ROUTE, CHANGE_PASSWORD_ROUTE, UPDATE_ME_ROUTE } from '@/service/app';

interface Props {
  /** Title shown at the top */
  title: string;
  /** Subtitle / role description */
  subtitle?: string;
  /** Extra work-detail fields to render (rendered after personal info) */
  workSection?: React.ReactNode;
  /** If provided, also updates profile-specific fields via this endpoint on save  */
  profileUpdateEndpoint?: string;
  profileUpdateBody?: (form: any) => Record<string, any>;
}

const GENDERS = ['Male', 'Female', 'Other'];

export default function SettingsPage({
  title,
  subtitle,
  workSection,
  profileUpdateEndpoint,
  profileUpdateBody,
}: Props) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // personal info form
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', gender: '', dob: '',
  });

  // change-password form
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiCLient.get(GET_USER_ROUTE);
        const d = res.data.data;
        // Support any profile shape: adminId / teacherId / studentId / direct
        const u = d?.adminId || d?.teacherId || d?.studentId || d?.counselorId || d;
        setForm({
          firstName: u?.firstName || '',
          lastName:  u?.lastName  || '',
          email:     u?.email     || '',
          phone:     u?.phone     || '',
          gender:    u?.gender    || '',
          dob:       u?.dob ? new Date(u.dob).toISOString().split('T')[0] : '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Always update the core User record
      await apiCLient.patch(UPDATE_ME_ROUTE, {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        gender:    form.gender,
        dob:       form.dob || undefined,
      });
      // If a profile-specific endpoint is provided, call it too
      if (profileUpdateEndpoint && profileUpdateBody) {
        await apiCLient.patch(profileUpdateEndpoint, profileUpdateBody(form));
      }
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPw(true);
    try {
      await apiCLient.post(CHANGE_PASSWORD_ROUTE, {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const fieldClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium";
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16 pt-20 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100 z-40 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>

        {/* ── Personal Info ── */}
        <form onSubmit={handleSave} className="space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className={fieldClass} placeholder="First name" />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className={fieldClass} placeholder="Last name" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}><Mail className="inline w-3 h-3 mr-1" />Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={fieldClass} placeholder="Email address" />
              </div>
              <div>
                <label className={labelClass}><Phone className="inline w-3 h-3 mr-1" />Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={fieldClass} placeholder="+91..." />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={fieldClass}>
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}><Calendar className="inline w-3 h-3 mr-1" />Date of Birth</label>
                <input name="dob" type="date" value={form.dob} onChange={handleChange} className={fieldClass} />
              </div>
            </div>
          </section>

          {/* Work section slot */}
          {workSection}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60 transition-all text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* ── Change Password ── */}
        <form onSubmit={handleChangePassword}>
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-500" /> Change Password
            </h2>
            <p className="text-xs text-gray-400 mb-6">Use a strong password. Minimum 6 characters.</p>

            <div className="space-y-4 max-w-md">
              {/* Old password */}
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={pwForm.oldPassword}
                    onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
                    className={fieldClass + ' pr-11'}
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowOld(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* New password */}
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                    className={fieldClass + ' pr-11'}
                    placeholder="New password (min 6 chars)"
                  />
                  <button type="button" onClick={() => setShowNew(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className={fieldClass}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={changingPw}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-sm hover:bg-rose-700 disabled:opacity-60 transition-all text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                {changingPw ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
