import React, { useMemo, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCLient,GET_STUDENT_PROFILE_ROUTE } from "@/service/app";
/* --------------------------------------------------------------------
   BASIC TYPES (simple TS)
   These mirror your schemas but are intentionally minimal so you can
   swap in real API types later without refactoring the UI.
-------------------------------------------------------------------- */

interface StudentProfile {
  studentId: string;
  name: string;
  admissionNo: string;
  yearOfAdmission: number;
  program: "BTECH" | "MTECH" | "MSC" | "PHD";
  semester: number;
  department?: "IT" | "CSE" | "ECE" | "EE" | "EEE" | "MECH" | "CIVIL";
  section?: string;
  academicYear?: number;
  hostellite?: "dayScholar" | "BoysHostle" | "Ish" | "GirlsHostel";
  permanentAddress?: string;
  currentAddress?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  father?: { name?: string };
  mother?: { name?: string };
}

interface AttendanceSubjectSummary {
  subjectCode: string;
  subjectName?: string;
  semester: number;
  totalClasses?: number; // provided by backend aggregate
  attended?: number; // provided by backend aggregate
}

interface SubjectMark {
  subjectCode: string;
  subjectName: string;
  specialCia?: number;
  cia1?: number;
  cia2?: number;
  cia3?: number;
  internalMarks?: number; // backend-provided
  externalMarks?: number; // backend-provided
  totalMarks?: number; // backend-provided
  letterGrade?: string; // backend-provided, e.g., "A+"
}

interface GradeSheet {
  studentId: string;
  semester: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  subjects: SubjectMark[];
  semesterExam?: number; // backend-provided
  sgpa?: number; // backend-provided
  remarks?: string;
}

/* --------------------------------------------------------------------
   DUMMY DATA (replace with API later)
   We do NOT compute anything here; display exactly what exists.
-------------------------------------------------------------------- */

const DEMO_PROFILE: Record<string, StudentProfile> = {
  STU001: {
    studentId: "STU001",
    name: "Amit Sharma",
    admissionNo: "23CSEDS11",
    yearOfAdmission: 2023,
    program: "BTECH",
    semester: 5,
    department: "CSE",
    section: "CSE-2",
    academicYear: 2025,
    hostellite: "BoysHostle",
    currentAddress: "JSS Boys Hostel, Noida",
    permanentAddress: "Agra, UP",
    bloodGroup: "B+",
    height: 172,
    weight: 68,
    father: { name: "Manoj Sharma" },
    mother: { name: "Sunita Sharma" },
  },
  STU002: {
    studentId: "STU002",
    name: "Priya Verma",
    admissionNo: "23ECEPL07",
    yearOfAdmission: 2023,
    program: "BTECH",
    semester: 3,
    department: "ECE",
    section: "ECE-1",
    academicYear: 2025,
    hostellite: "GirlsHostel",
    currentAddress: "JSS Girls Hostel, Noida",
    permanentAddress: "Lucknow, UP",
    bloodGroup: "O+",
    father: { name: "Rajesh Verma" },
    mother: { name: "Meera Verma" },
  },
};

const DEMO_ATTENDANCE_SUMMARY: Record<string, AttendanceSubjectSummary[]> = {
  STU001: [
    {
      subjectCode: "CS501",
      subjectName: "Algorithms",
      semester: 5,
      totalClasses: 42,
      attended: 38,
    },
    {
      subjectCode: "CS502",
      subjectName: "DBMS",
      semester: 5,
      totalClasses: 40,
      attended: 35,
    },
    {
      subjectCode: "CS503",
      subjectName: "OS",
      semester: 5,
      totalClasses: 38,
      attended: 31,
    },
  ],
  STU002: [
    {
      subjectCode: "EC301",
      subjectName: "Signals",
      semester: 3,
      totalClasses: 36,
      attended: 30,
    },
    {
      subjectCode: "EC302",
      subjectName: "Networks",
      semester: 3,
      totalClasses: 34,
      attended: 28,
    },
  ],
};

const DEMO_GRADES: Record<string, GradeSheet[]> = {
  STU001: [
    {
      studentId: "STU001",
      semester: 5,
      subjects: [
        {
          subjectCode: "CS501",
          subjectName: "Algorithms",
          specialCia: 5,
          cia1: 24,
          cia2: 25,
          cia3: 22,
          internalMarks: 76,
          externalMarks: 30,
          totalMarks: 106,
          letterGrade: "A+",
        },
        {
          subjectCode: "CS502",
          subjectName: "DBMS",
          specialCia: 0,
          cia1: 23,
          cia2: 21,
          cia3: 24,
          internalMarks: 68,
          externalMarks: 32,
          totalMarks: 100,
          letterGrade: "A",
        },
        {
          subjectCode: "CS503",
          subjectName: "OS",
          specialCia: 0,
          cia1: 20,
          cia2: 17,
          cia3: 19,
          internalMarks: 56,
          externalMarks: 28,
          totalMarks: 84,
          letterGrade: "B+",
        },
      ],
      semesterExam: 290,
      sgpa: 8.8,
      remarks: "Good progress; focus on OS theory.",
    },
    {
      studentId: "STU001",
      semester: 4,
      subjects: [
        {
          subjectCode: "CS405",
          subjectName: "ADA",
          specialCia: 0,
          cia1: 22,
          cia2: 23,
          cia3: 20,
          internalMarks: 65,
          externalMarks: 34,
          totalMarks: 99,
          letterGrade: "A",
        },
        {
          subjectCode: "CS406",
          subjectName: "CN",
          specialCia: 0,
          cia1: 19,
          cia2: 21,
          cia3: 20,
          internalMarks: 60,
          externalMarks: 31,
          totalMarks: 91,
          letterGrade: "A",
        },
        {
          subjectCode: "CS407",
          subjectName: "COA",
          specialCia: 0,
          cia1: 18,
          cia2: 19,
          cia3: 22,
          internalMarks: 59,
          externalMarks: 29,
          totalMarks: 88,
          letterGrade: "B+",
        },
      ],
      semesterExam: 270,
      sgpa: 8.4,
      remarks: "Stable semester.",
    },
  ],
  STU002: [
    {
      studentId: "STU002",
      semester: 3,
      subjects: [
        {
          subjectCode: "EC301",
          subjectName: "Signals",
          specialCia: 0,
          cia1: 21,
          cia2: 24,
          cia3: 23,
          internalMarks: 68,
          externalMarks: 29,
          totalMarks: 97,
          letterGrade: "A",
        },
        {
          subjectCode: "EC302",
          subjectName: "Networks",
          specialCia: 0,
          cia1: 22,
          cia2: 20,
          cia3: 21,
          internalMarks: 63,
          externalMarks: 30,
          totalMarks: 93,
          letterGrade: "A",
        },
      ],
      semesterExam: 190,
      sgpa: 8.2,
      remarks: "Consistent.",
    },
  ],
};

/* --------------------------------------------------------------------
   COMPONENT
   - Tabs: Overview | Attendance | Grades
   - No calculations: we display and locally edit backend-provided values only.
-------------------------------------------------------------------- */

export default function MenteeDetails(): JSX.Element {
  const { studentId } = useParams();
  const navigate = useNavigate();

  /* paragraph: resolve the base profile. If the route param doesn’t match
     our dummy map yet, we fall back to STU001 so the page always renders. */
  const profile: StudentProfile =
    (studentId && DEMO_PROFILE[studentId]) || DEMO_PROFILE["STU001"];

  /* paragraph: initialize local editable state for attendance and grades.
     Later, replace these with real fetches and POST/PATCH calls. */
  const [attendance, setAttendance] = useState<AttendanceSubjectSummary[]>(
    DEMO_ATTENDANCE_SUMMARY[profile.studentId] || []
  );
  const [gradeSheets, setGradeSheets] = useState<GradeSheet[]>(
    DEMO_GRADES[profile.studentId] || []
  );

  /* paragraph: find the current semester sheet (purely to show it first
     in overview). This is just a lookup, not a calculation. */
  const currentSemSheet = useMemo(() => {
    return gradeSheets.find((g) => g.semester === profile.semester);
  }, [gradeSheets, profile.semester]);

  /* paragraph: UI tab state — keep it simple with a union of literal strings. */
  const [tab, setTab] = useState<"overview" | "attendance" | "grades">(
    "overview"
  );

  /* paragraph: attendance change handler — we only assign the value
     to state; no derived totals or percentages are computed. */
  const onAttendanceChange = (
    index: number,
    field: "totalClasses" | "attended",
    value: number
  ) => {
    setAttendance((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  /* paragraph: grade cell change handler — directly writes to state.
     We don’t recompute internal/total/letter here. */
  const onGradeChange = (
    sheetIndex: number,
    subjectIndex: number,
    field:
      | "specialCia"
      | "cia1"
      | "cia2"
      | "cia3"
      | "internalMarks"
      | "externalMarks"
      | "totalMarks"
      | "letterGrade",
    value: string
  ) => {
    setGradeSheets((prev) => {
      const sheets = [...prev];
      const sheet = { ...sheets[sheetIndex] };
      const subjects = [...sheet.subjects];
      const s: any = { ...subjects[subjectIndex] };

      if (
        field === "specialCia" ||
        field === "cia1" ||
        field === "cia2" ||
        field === "cia3" ||
        field === "internalMarks" ||
        field === "externalMarks" ||
        field === "totalMarks"
      ) {
        s[field] = value === "" ? undefined : Number(value);
      } else {
        s[field] = value;
      }

      subjects[subjectIndex] = s as SubjectMark;
      sheet.subjects = subjects;
      sheets[sheetIndex] = sheet;
      return sheets;
    });
  };

  /* paragraph: save click — just a placeholder alert for now.
     Wire this to your backend later. */
  const onSave = () => {
    alert("Saved locally. Hook this button to your API later.");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6">
      {/* ----------------------------------------------------------------
         HEADER: student snapshot + simple action buttons
         This top section keeps context visible and actions accessible.
      ----------------------------------------------------------------- */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">
              {profile.department || "—"} • {profile.section || "—"}
            </div>
            <h1 className="text-2xl font-bold leading-tight">
              {profile.name}{" "}
              <span className="text-gray-400 font-normal">
                ({profile.admissionNo})
              </span>
            </h1>
            <div className="mt-1 text-sm text-gray-600">
              {profile.program} • Semester {profile.semester} • YOAdm{" "}
              {profile.yearOfAdmission}
              {profile.academicYear ? ` • AY ${profile.academicYear}` : ""}
            </div>
            {currentSemSheet?.sgpa !== undefined && (
              <div className="mt-1 text-xs inline-flex items-center gap-2 rounded-full border px-3 py-1">
                SGPA (Sem {currentSemSheet.semester}):{" "}
                <b>{currentSemSheet.sgpa}</b>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={onSave}
              className="rounded-lg bg-black text-white px-3 py-2 text-sm hover:bg-gray-900"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* paragraph: simple tab switcher */}
        <div className="mt-4 flex gap-2">
          {(["overview", "attendance", "grades"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-lg text-sm ${
                tab === t ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------------
         CONTENT: renders one of the three tabs
      ----------------------------------------------------------------- */}
      <div className="mt-6 space-y-6">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <section className="grid gap-4 lg:grid-cols-3">
            {/* Program snapshot */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Program Snapshot</h2>
              <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-gray-500">Admission No</div>
                <div className="font-medium">{profile.admissionNo}</div>

                <div className="text-gray-500">Year of Admission</div>
                <div className="font-medium">{profile.yearOfAdmission}</div>

                <div className="text-gray-500">Program</div>
                <div className="font-medium">{profile.program}</div>

                <div className="text-gray-500">Department</div>
                <div className="font-medium">{profile.department || "—"}</div>

                <div className="text-gray-500">Section</div>
                <div className="font-medium">{profile.section || "—"}</div>

                <div className="text-gray-500">Semester</div>
                <div className="font-medium">{profile.semester}</div>
              </div>
            </div>

            {/* Addresses */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Addresses</h2>
              <div className="text-sm space-y-2">
                <div>
                  <div className="text-gray-500">Current Address</div>
                  <div className="font-medium">
                    {profile.currentAddress || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Permanent Address</div>
                  <div className="font-medium">
                    {profile.permanentAddress || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Family & Health */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Family & Health</h2>
              <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-gray-500">Blood Group</div>
                <div className="font-medium">{profile.bloodGroup || "—"}</div>

                <div className="text-gray-500">Height</div>
                <div className="font-medium">
                  {profile.height !== undefined ? `${profile.height} cm` : "—"}
                </div>

                <div className="text-gray-500">Weight</div>
                <div className="font-medium">
                  {profile.weight !== undefined ? `${profile.weight} kg` : "—"}
                </div>

                <div className="text-gray-500">Father</div>
                <div className="font-medium">{profile.father?.name || "—"}</div>

                <div className="text-gray-500">Mother</div>
                <div className="font-medium">{profile.mother?.name || "—"}</div>
              </div>
            </div>
          </section>
        )}

        {/* ATTENDANCE */}
        {tab === "attendance" && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Attendance</h2>
              <div className="text-sm text-gray-500">
                Semester {profile.semester}
              </div>
            </div>

            {/* paragraph: grid table of per-subject summary; with percentages */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Total Classes</th>
                    <th className="py-2 px-3">Attended</th>
                    <th className="py-2 px-3">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, idx) => {
                    const percent =
                      row.totalClasses && row.attended !== undefined
                        ? ((row.attended / row.totalClasses) * 100).toFixed(1)
                        : "—";
                    return (
                      <tr key={row.subjectCode} className="border-t">
                        <td className="py-2 px-3">{row.subjectName || "—"}</td>
                        <td className="py-2 px-3 text-gray-600">
                          {row.subjectCode}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            className="w-24 rounded border px-2 py-1"
                            value={row.totalClasses ?? ""}
                            onChange={(e) =>
                              onAttendanceChange(
                                idx,
                                "totalClasses",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            className="w-24 rounded border px-2 py-1"
                            value={row.attended ?? ""}
                            onChange={(e) =>
                              onAttendanceChange(
                                idx,
                                "attended",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td className="py-2 px-3 text-gray-700">
                          {percent !== "—" ? `${percent}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* GRADES */}
        {tab === "grades" && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Grades</h2>

            {/* paragraph: show each semester sheet, exactly as backend provides */}
            <div className="mt-4 space-y-8">
              {gradeSheets.map((sheet, sheetIndex) => (
                <div
                  key={sheetIndex}
                  className="rounded-xl border bg-gray-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">Semester {sheet.semester}</div>
                    <div className="text-sm text-gray-600">
                      SGPA: <b>{sheet.sgpa ?? "—"}</b>
                      <span className="mx-2">•</span>
                      Semester Exam: <b>{sheet.semesterExam ?? "—"}</b>
                    </div>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-2 px-3">Subject</th>
                          <th className="py-2 px-3">Code</th>
                          <th className="py-2 px-3">CIA1</th>
                          <th className="py-2 px-3">CIA2</th>
                          <th className="py-2 px-3">CIA3</th>
                          <th className="py-2 px-3">Special CIA</th>
                          <th className="py-2 px-3">Internal</th>
                          <th className="py-2 px-3">External</th>
                          <th className="py-2 px-3">Total</th>
                          <th className="py-2 px-3">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.subjects.map((s, subjectIndex) => (
                          <tr
                            key={`${s.subjectCode}-${subjectIndex}`}
                            className="border-t"
                          >
                            <td className="py-2 px-3">{s.subjectName}</td>
                            <td className="py-2 px-3 text-gray-600">
                              {s.subjectCode}
                            </td>

                            {(
                              [
                                "cia1",
                                "cia2",
                                "cia3",
                                "specialCia",
                                "internalMarks",
                                "externalMarks",
                                "totalMarks",
                                "letterGrade",
                              ] as const
                            ).map((field) => (
                              <td key={field} className="py-2 px-3">
                                {field === "letterGrade" ? (
                                  <input
                                    type="text"
                                    className="w-20 rounded border px-2 py-1"
                                    value={s.letterGrade ?? ""}
                                    onChange={(e) =>
                                      onGradeChange(
                                        sheetIndex,
                                        subjectIndex,
                                        "letterGrade",
                                        e.target.value
                                      )
                                    }
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    className="w-24 rounded border px-2 py-1"
                                    value={(s as any)[field] ?? ""}
                                    onChange={(e) =>
                                      onGradeChange(
                                        sheetIndex,
                                        subjectIndex,
                                        field,
                                        e.target.value
                                      )
                                    }
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {sheet.remarks && (
                    <div className="mt-2 text-xs text-gray-600">
                      Remarks: {sheet.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
