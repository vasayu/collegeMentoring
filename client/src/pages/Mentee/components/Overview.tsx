import React from "react";
import { UserCircle, MapPin, BookOpen, Shield, HeartPulse, Users, Phone, Mail, Award, Activity } from "lucide-react";

type StudentProfile = {
  firstName?: string;
  lastName?: string;
  admissionNo?: string;
  program?: string;
  semester?: number;
  yearOfAdmission?: number;
  hostellite?: boolean | string;
  department?: string;
  section?: string;
  localGuardian?: { name?: string; relation?: string; phone?: string; address?: string } | null;
  father?: Record<string, any> | null;
  mother?: Record<string, any> | null;
  siblings?: Array<{ name?: string; relation?: string }>;
  careerGoals?: string;
  strengths?: string[];
  achievements?: string[];
  hobbies?: string[];
  subjectsOfInterest?: string[];
  address?: string;
  currentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
};

type GradeSheet = {
  semester: number;
  sgpa: number;
};

type Props = {
  profile: StudentProfile;
  currentSemSheet?: GradeSheet | undefined;
};

export default function Overview({ profile, currentSemSheet }: Props) {
  const basicInfo = [
    { label: "Admission No", value: profile.admissionNo },
    { label: "Program", value: profile.program },
    { label: "Semester", value: profile.semester },
    { label: "Year of Admission", value: profile.yearOfAdmission },
    { label: "Residential Status", value: profile.hostellite ?? "—" },
  ];

  const healthInfo = [
    { label: "Blood Group", value: profile.bloodGroup },
    { label: "Height (cm)", value: profile.height },
    { label: "Weight (kg)", value: profile.weight },
  ];

  const addresses = [
    { label: "Present Address", value: profile.address ?? profile.currentAddress },
    { label: "Permanent Address", value: profile.permanentAddress },
  ];

  const academicProfile = [
    { label: "Career Goals", value: profile.careerGoals },
    {
      label: "Strengths",
      value: Array.isArray(profile.strengths) ? profile.strengths.join(", ") : profile.strengths ?? "—",
    },
    {
      label: "Achievements",
      value: Array.isArray(profile.achievements) ? profile.achievements.join(", ") : profile.achievements ?? "—",
    },
    {
      label: "Hobbies",
      value: Array.isArray(profile.hobbies) ? profile.hobbies.join(", ") : profile.hobbies ?? "—",
    },
    {
      label: "Subjects of Interest",
      value: Array.isArray(profile.subjectsOfInterest) ? profile.subjectsOfInterest.join(", ") : profile.subjectsOfInterest ?? "—",
    },
  ];

  function renderKeyValues(rows: any[]) {
    return (
      <dl className="divide-y divide-gray-100/80">
        {rows.map((row, idx) => {
          const v = row.value !== undefined && row.value !== null && row.value !== "" ? row.value : "—";
          return (
            <div key={idx} className="grid grid-cols-12 gap-3 py-3.5 group hover:bg-gray-50/50 transition-colors rounded-lg px-2 -mx-2">
              <dt className="col-span-12 sm:col-span-5 text-sm font-medium text-gray-500 flex items-center">{row.label}</dt>
              <dd className="col-span-12 sm:col-span-7 text-sm font-bold text-gray-900 break-words flex items-center">{v}</dd>
            </div>
          );
        })}
      </dl>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Value Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Admission No", value: profile.admissionNo, icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Program", value: profile.program, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Semester", value: profile.semester, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Residency", value: profile.hostellite, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((item, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${item.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</div>
              </div>
              <div className="mt-1 text-lg font-bold text-gray-900">{item.value ?? "—"}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-3 bg-gray-50/30">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-gray-900">Basic Information</h3>
            </div>
            <div className="px-6 py-4">{renderKeyValues(basicInfo)}</div>
          </section>

          {/* Addresses */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-3 bg-gray-50/30">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-gray-900">Addresses</h3>
            </div>
            <div className="px-6 py-4">{renderKeyValues(addresses)}</div>
          </section>

          {/* Academic Profile */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-3 bg-gray-50/30">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-900">Academic Profile</h3>
            </div>
            <div className="px-6 py-4">{renderKeyValues(academicProfile)}</div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-1">
          {/* Health */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-3 bg-gray-50/30">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-gray-900">Health</h3>
            </div>
            <div className="px-6 py-4">{renderKeyValues(healthInfo)}</div>
          </section>

          {/* Local Guardian */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="border-b border-gray-50 px-6 py-4 flex items-center gap-3 bg-gray-50/30">
              <UserCircle className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-gray-900">Local Guardian</h3>
            </div>
            <div className="px-6 py-4">
              {profile.localGuardian ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                      {profile.localGuardian.name?.charAt(0) || "G"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{profile.localGuardian.name ?? "—"}</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase">{profile.localGuardian.relation ?? "Guardian"}</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                     <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-700">{profile.localGuardian.phone ?? "—"}</span>
                     </div>
                     <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="font-medium text-gray-600 line-clamp-2">{profile.localGuardian.address ?? "—"}</span>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-400 py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">No guardian listed</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Family Section */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="border-b border-gray-50 px-6 py-4 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-bold text-gray-900">Family</h3>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 uppercase tracking-wide">Parents &amp; Siblings</span>
        </div>

        <div className="flex gap-4 overflow-x-auto px-6 py-6 [scrollbar-width:none]">
          {/* Father */}
          <div className="min-w-[280px] rounded-2xl border border-gray-100 bg-white hover:border-teal-100 hover:shadow-lg hover:shadow-teal-100/50 transition-all p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-lg font-bold text-white shadow-sm">F</div>
              <div>
                <div className="text-base font-extrabold text-gray-900">Father</div>
                <div className="text-xs font-semibold text-gray-500">{profile.father?.name || "—"}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm bg-gray-50/50 rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 font-medium">Occupation</span>
                <span className="font-bold text-gray-900">{profile.father?.occupation || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 font-medium">Phone</span>
                <span className="font-bold text-gray-900">{profile.father?.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="truncate font-bold text-gray-900">{profile.father?.email || "—"}</span>
              </div>
            </div>
          </div>

          {/* Mother */}
          <div className="min-w-[280px] rounded-2xl border border-gray-100 bg-white hover:border-teal-100 hover:shadow-lg hover:shadow-teal-100/50 transition-all p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-lg font-bold text-white shadow-sm">M</div>
              <div>
                <div className="text-base font-extrabold text-gray-900">Mother</div>
                <div className="text-xs font-semibold text-gray-500">{profile.mother?.name || "—"}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm bg-gray-50/50 rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 font-medium">Occupation</span>
                <span className="font-bold text-gray-900">{profile.mother?.occupation || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 font-medium">Phone</span>
                <span className="font-bold text-gray-900">{profile.mother?.phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="truncate font-bold text-gray-900">{profile.mother?.email || "—"}</span>
              </div>
            </div>
          </div>

          {/* Siblings */}
          {(Array.isArray(profile.siblings) ? profile.siblings : []).map((s, i) => (
            <div key={i} className="min-w-[220px] rounded-2xl border border-gray-100 bg-white hover:border-teal-100 hover:shadow-sm transition-all p-5 flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-600 mb-3">S</div>
              <div className="text-base font-extrabold text-gray-900">{s.name || "Sibling"}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">{s.relation || "—"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
