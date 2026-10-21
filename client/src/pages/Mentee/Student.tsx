// src/pages/StudentDashboard.tsx
import { useEffect, useMemo, useState, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Overview from "./components/Overview";
import Attendance from "./components/Attendance";
import Grades from "./components/Grades";
import SurveyReport from "./components/SurveyReport";
import { apiCLient } from "@/service/app";
import FeedbackPage from "./components/FeedbackPage";
import SurveyPage from "./components/SurveyPage";
import { ArrowLeft, User, GraduationCap, Calendar, Hash } from "lucide-react";

type StudentProfile = {
    studentId?: {
        firstName?: string;
        lastName?: string;
        department?: string;
        dob?: string | Date;
        email?: string;
        role?: number;
        phone?: string;
    }
    admissionNo?: string;
    yearOfAdmission?: number;
    program?: string;
    semester?: number;
    hostellite?: boolean | string;
    permanentAddress?: string;
    currentAddress?: string;
    address?: string;
    bloodGroup?: string;
    height?: number;
    weight?: number;
    localGuardian?: {
        name?: string;
        relation?: string;
        phone?: string;
        address?: string;
    } | null;
    father?: Record<string, any> | null;
    mother?: Record<string, any> | null;
    siblings?: Array<{ name?: string; relation?: string }>;
    careerGoals?: string;
    strengths?: string[];
    achievements?: string[];
    hobbies?: string[];
    subjectsOfInterest?: string[];
    createdAt?: string;
    section?: string;
    [k: string]: any;
};

export type SubjectMark = {
    subjectCode: string;
    subjectName: string;
    credits: number;
    cia1?: number;
    cia2?: number;
    cia3?: number;
    specialCia?: number;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    totallecture: number;
    numberOfClassAttend: number;
    letterGrade: string;
};
export type GradeSheet = {
    semester: number;
    subjects: SubjectMark[];
    sgpa: number;
    remarks?: string;
    studentId?: string;
};

export default function StudentDashboard(): JSX.Element {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = useSelector((state: any) => state.auth.userData) as
        | StudentProfile
        | undefined;
    const [profile, setProfile] = useState<StudentProfile>({})
    const [gradeSheets, setGradeSheets] = useState<GradeSheet[]>([]);
    let role = null;
    let tabs: any[] = [];
    if (user?.studentId) {
        role = user.studentId.role;
        tabs = ["overview", "attendance", "grades", "feedback", "survey"];
    } else if (user?.teacherId) {
        role = user.teacherId.role;
        tabs = ["overview", "attendance", "grades", "surveyReport"];
    } else if (user?.adminId) {
        role = user.adminId.role;
        tabs = ["overview", "attendance", "grades", "surveyReport"];
    }
    useEffect(() => {
        const fetchAMData = async () => {
            const res = await apiCLient.get(`/mentors/student/${id}`)
            setProfile(res.data.data);
            const gradeRes = await apiCLient.post(`/users/get-grade/`, { studentId: res.data.data._id })
            setGradeSheets(gradeRes.data.data);
        }
        const fetchGradeSheets = async () => {
            const gradeRes = await apiCLient.post(`/users/get-grade/`, { studentId: user?._id })
            setGradeSheets(gradeRes.data.data);
        }
        if (!user?.studentId) {
            fetchAMData();
        } else {
            fetchGradeSheets();
            setProfile(user);
            console.log(user);
        }

    }, [])

    const currentSemSheet = useMemo(() => {
        return gradeSheets.find((g) => g.semester === profile.semester);
    }, [gradeSheets, profile.semester]);

    const [tab, setTab] = useState<"overview" | "attendance" | "grades" | "feedback" | "survey" | "surveyReport">(
        "overview"
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 pt-8 sm:pt-16 px-4 sm:px-6 lg:px-10 relative">
            {/* Top Navigation Row */}
            {role !== 0 && (
                <div className="max-w-[100rem] mx-auto mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-fit active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold text-sm">Back</span>
                    </button>
                </div>
            )}

            <div className="max-w-[100rem] mx-auto space-y-8">
                {/* Hero Profile Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                            <User className="w-12 h-12 opacity-90" />
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                        </div>

                        {/* Core Info */}
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    {profile.studentId?.firstName ?? "Loading"} {profile.studentId?.lastName ?? ""}
                                </h1>
                                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide uppercase">
                                    {profile.program ?? "Student"}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    <span>{profile.admissionNo ?? "—"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    <span>{profile.studentId?.department ?? "—"} • {profile.section || "—"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Sem {profile.semester ?? "—"} • YOA {profile.yearOfAdmission ?? "—"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Highlight Stats (e.g. SGPA) */}
                        {currentSemSheet?.sgpa && (
                            <div className="flex-shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[140px]">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current SGPA</span>
                                <span className="text-3xl font-black text-indigo-700">{currentSemSheet.sgpa}</span>
                                <span className="text-xs font-semibold text-gray-400 mt-0.5">Sem {currentSemSheet.semester}</span>
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex gap-2 overflow-x-auto [scrollbar-width:none]">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap capitalize ${
                                    tab === t 
                                        ? "bg-gray-900 text-white shadow-md shadow-gray-900/10" 
                                        : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                {t.replace(/([A-Z])/g, ' $1').trim()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content Rendering Container */}
                <div className="w-full relative z-0">
                    <div className="transition-all duration-300">
                        {tab === "overview" && <Overview profile={profile} currentSemSheet={currentSemSheet} />}
                        {tab === "attendance" && (
                            <Attendance
                                gradeSheets={gradeSheets}
                                onSaved={(updatedSubjects) => setGradeSheets(updatedSubjects)}
                                studentId={gradeSheets[0]?.studentId}
                            />
                        )}
                        {tab === "grades" && <Grades gradeSheets={gradeSheets} onSaved={(updated: GradeSheet[]) => setGradeSheets(updated)} studentId={gradeSheets[0]?.studentId} />}
                        {tab === "feedback" && <FeedbackPage studentId={user?._id} />}
                        {tab === "survey" && <SurveyPage />}
                        {tab === "surveyReport" && <SurveyReport studentId={id} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
