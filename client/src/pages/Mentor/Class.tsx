// src/pages/admin/ClassDetails.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiCLient, GET_ALL_STUDENTS_OF_MINE_CLASS_ROUTE, GET_MY_CLASSES_ROUTE } from "@/service/app"; // define GET_CLASS_BY_ID route
import toast from "react-hot-toast";
import AssignMentor from "./components/AssignMentor";
import AddStudentOverlay from "./components/AddStudent";
import AddSubjects from "./components/AddSubject";
import ClassStudents from "./components/ClassStudents";
import StressAnalytics from "./components/StressAnalytics";
import { LayoutDashboard, UserCheck, Users, BookOpen, Activity } from "lucide-react";

interface Mentor {
    _id: string;
    teacherId: {
        firstName: string;
        lastName?: string;
        email: string;
        department: string;
    };
    employeeId: string;
    specialization: string[];
    designation?: string;
}

interface Student {
    _id: string;
    studentId: {
        firstName: string;
        lastName?: string;
        email: string;
        department: string;
        _id: string;
    };
    admissionNo: string;
    semester: number;
    yearOfAdmission: number;
}
interface Class {
    _id: string;
    section: string;
    department: string;
    semester: number;
    academicStartYear: number;
    mentorId?: Mentor;
    students: Student[];
    subjects: any
}

export default function Class() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [tab, setTab] = useState("classDetails");
    const data = localStorage.getItem('userData')
    const [refreshKey, setRefreshKey] = useState(0);
    let user: any = null;
    if (data) {
        user = JSON.parse(data);
    }
    let role: number | null = null;

    if (user.studentId) {
        role = user.studentId.role;
    } else if (user.teacherId) {
        role = user.teacherId.role;
    } else if (user.adminId) {
        role = user.adminId.role;
    } else if (user.role) {
        role = user.role;
    }

    const [cls, setCls] = useState<Class>({
        _id: "",
        section: "",
        department: "",
        semester: 0,
        academicStartYear: 0,
        mentorId: undefined,
        students: [],
        subjects: []
    });
    const [mentor, setMentor] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [assignDialogue, setAssignDialogue] = useState(false);
    const [addStudentDialogue, setAddStudentDialogue] = useState(false);
    useEffect(() => {
        const fetchClass = async () => {
            try {
                setLoading(true);
                if (user?.teacherId) {
                    const classRes = await apiCLient.get(GET_MY_CLASSES_ROUTE);
                    const classData = classRes.data.data[0];
                    setCls(classData);
                    const res1 = await apiCLient.get(GET_ALL_STUDENTS_OF_MINE_CLASS_ROUTE);
                    setStudents(res1.data.data);
                    
                    if (classData?.mentorId) {
                        setMentor({
                            firstName: classData.mentorId.teacherId?.firstName,
                            lastName: classData.mentorId.teacherId?.lastName,
                            email: classData.mentorId.teacherId?.email,
                            designation: classData.mentorId.designation,
                            specialization: classData.mentorId.specialization
                        });
                    } else {
                        setMentor(null);
                    }
                } else if (user?.adminId) {
                    const res = await apiCLient.get(`/admin/class/${id}`);
                    const classData = res.data.data;
                    setCls(classData);
                    setStudents(classData.students);
                    
                    if (classData?.mentorId) {
                        setMentor({
                            firstName: classData.mentorId.teacherId?.firstName,
                            lastName: classData.mentorId.teacherId?.lastName,
                            email: classData.mentorId.teacherId?.email,
                            designation: classData.mentorId.designation,
                            specialization: classData.mentorId.specialization
                        });
                    } else {
                        setMentor(null);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch class details");
            } finally {
                setLoading(false);
            }
        };
        fetchClass();
    }, [id, refreshKey]);

    if (loading) return <p className="p-10">Loading...</p>;
    if (!cls) return <p className="p-10">No class data found.</p>;

    const tabs = [
        { id: "classDetails", label: "Class Details", icon: <LayoutDashboard size={20} /> },
        { id: "mentorDetails", label: "Mentor Details", icon: <UserCheck size={20} /> },
        { id: "studentsEnrolled", label: "Students Enrolled", icon: <Users size={20} /> },
        { id: "subjects", label: "Subjects", icon: <BookOpen size={20} /> },
        { id: "stressAnalytics", label: "Stress Analytics", icon: <Activity size={20} /> },
    ];

    return (
        <div className="flex bg-gray-50/50 min-h-[calc(100vh-4rem)]">
            <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
                <div className="p-6 pb-2">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">Class Details</h2>
                </div>
                <nav className="flex-1 px-4 mt-4 space-y-1.5">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                tab === t.id
                                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <main className="flex-1 p-6 md:p-10 overflow-x-hidden min-w-0">
                <div className="w-full flex flex-col gap-6">
                {assignDialogue ? <AssignMentor
                    onClose={() => setAssignDialogue(false)}
                    classId={cls?._id}
                    onSuccess={() => {
                        setRefreshKey((prev) => prev + 1);
                    }}
                /> : <div></div>}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {cls?.section} ({cls?.department})
                        </h2>
                        <p className="text-gray-500 font-medium mt-1">Semester {cls?.semester}</p>
                    </div>
                    {role === 2 && (
                        <Link
                            to={`/class/${cls?._id}/edit`}
                            className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 shadow-sm transition-all"
                        >
                            Edit Class
                        </Link>
                    )}
                </div>

                {/* Class Info */}
                {tab === "classDetails" && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Class Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Year</span>
                                <span className="text-lg font-medium text-gray-900 mb-1">{cls?.academicStartYear}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</span>
                                <span className="inline-flex items-center w-fit px-3 py-1 rounded-md text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                                    {cls?.department}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</span>
                                <span className="text-lg font-medium text-gray-900">Semester {cls?.semester}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mentor Info */}
                {tab === "mentorDetails" && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all">
                        <div className="flex flex-row justify-between items-center border-b pb-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Mentor Profile</h3>
                            {role === 2 && (
                                <button
                                    onClick={() => { setAssignDialogue(true) }}
                                    className="bg-blue-50 text-blue-600 font-semibold px-4 py-2 text-sm rounded-xl hover:bg-blue-100 transition-colors border border-blue-100/50"
                                >
                                    Change mentor
                                </button>
                            )}
                        </div>
                        {mentor ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</span>
                                    <span className="text-lg font-medium text-gray-900">{mentor.firstName} {mentor.lastName}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
                                    <span className="text-lg font-medium text-gray-900">{mentor.email}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</span>
                                    <span className="text-lg font-medium text-gray-900">{mentor.designation || user.designation || '-'}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</span>
                                    <span className="text-lg font-medium text-gray-900">{mentor.specialization?.join(", ") || user.specialization?.join(", ") || '-'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 justify-center items-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                    <UserCheck className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No mentor assigned to this class yet.</p>
                                {role === 2 && (
                                    <button 
                                        onClick={() => setAssignDialogue(true)} 
                                        className="mt-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all"
                                    >
                                        Assign Mentor
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {tab === "studentsEnrolled" &&
                    <ClassStudents
                        classId={cls._id}
                        students={students}
                        onStudentUpdated={() => setRefreshKey((prev) => prev + 1)}
                    />
                }
                {tab === "subjects" &&
                    <AddSubjects
                        sectionId={cls._id}
                        onSuccess={(subjects) => {
                            setCls((prev: any) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        subjects: subjects,
                                    };
                                }
                            });
                        }}
                        initialSubjects={cls.subjects}
                    />
                }
                {tab === "stressAnalytics" &&
                    <StressAnalytics
                        classId={cls._id}
                    />
                }
                </div>
            </main>
        </div>
    );
}
