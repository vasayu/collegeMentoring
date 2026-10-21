import { useEffect, useState } from "react";
import { apiCLient, GET_ALL_MENTORS, GET_USER_ROUTE, GET_ALL_COUNSELORS_ROUTE } from "@/service/app";
import { useAuth } from "@/context/AuthContext";

import AdminSidebar, { type TabType } from "./components/AdminSidebar";
import AdminDashboardPanel from "./components/AdminDashboardPanel";
import AdminMentorsPanel from "./components/AdminMentorsPanel";
import AdminStudentsPanel from "./components/AdminStudentsPanel";
import AdminCounselorsPanel from "./components/AdminCounselorsPanel";
import AdminAdminsPanel from "./components/AdminAdminsPanel";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface AdminProfile {
    _id: string;
    adminId: {
        firstName: string;
        email: string;
        gender: string;
        department: string;
        role: number;
    }
    employeeId: string;
    designation: string;
    teachers: string[];
    classes: string[];
}

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
    designation: string;
}

interface Counselor {
    _id: string;
    counselorId: {
        firstName: string;
        lastName?: string;
        email: string;
        department: string;
    };
    employeeId: string;
    specialization?: string[];
    qualifications?: string[];
    yearsOfExperience?: number;
    address?: string;
}

export default function AdminHome() {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const [mentors, setMentors] = useState<any[]>([]);
    const [counselors, setCounselors] = useState<Counselor[] | null>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const profileRes = await apiCLient.get(GET_USER_ROUTE);
                const raw = profileRes.data;
                setAdmin({
                    _id: raw.data._id,
                    adminId: {
                        firstName: raw.data.adminId.firstName,
                        email: raw.data.adminId.email,
                        gender: raw.data.adminId.gender,
                        department: raw.data.adminId.department,
                        role: raw.data.adminId.role,
                    },
                    employeeId: raw.data.employeeId,
                    designation: raw.data.designation,
                    teachers: raw.data.teachers,
                    classes: raw.data.classes
                })

                const mentorsRes = await apiCLient.get(GET_ALL_MENTORS);
                setMentors(mentorsRes.data.data);

                const counselorsRes = await apiCLient.get(GET_ALL_COUNSELORS_ROUTE);
                setCounselors(counselorsRes.data.data);

            } catch (err: any) {
                setError("Unable to fetch data");
                toast.error("Unable to fetch data");
                // if(err.response?.status === 401){
                //     localStorage.removeItem("userData");
                //     navigate("/signin");
                // }
            } finally {
                setLoading(false);
            }
        };
        fetchAdmin();
        refreshUser();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (!admin) return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-6">
            <p className="p-5 bg-red-50 border border-red-200 text-red-700 shadow-sm rounded-2xl font-bold">{error || "No admin data available. Please login again."}</p>
        </div>
    );

    const renderActivePanel = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboardPanel admin={admin} />;
            case 'mentors':
                return <AdminMentorsPanel mentors={mentors || []} adminDepartment={admin?.adminId?.department} role={admin?.adminId?.role} />;
            case 'students':
                return <AdminStudentsPanel adminDepartment={admin?.adminId?.department} role={admin?.adminId?.role} />;
            case 'counselors':
                return <AdminCounselorsPanel counselors={counselors || []} />;
            case 'admins':
                return <AdminAdminsPanel />;
            default:
                return <AdminDashboardPanel admin={admin} />;
        }
    };

    return (
        <div className="flex bg-gray-50/50 min-h-[calc(100vh-4rem)] flex-col md:flex-row w-full">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} role={admin?.adminId?.role} />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 lg:pl-6 overflow-x-hidden min-w-0 w-full">
                {renderActivePanel()}
            </main>
        </div>
    );
}
