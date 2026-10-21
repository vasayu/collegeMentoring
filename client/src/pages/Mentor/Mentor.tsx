import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCLient, GET_MY_CLASSES_ROUTE } from "@/service/app";

type Mentor = {
    _id: string;
    employeeId: string;
    yearsOfExperience: number;
    teacherId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        gender: string;
        department: string;
    };
    adminId:{
        firstName:string;
        email:string;
        gender:string;
        department:string;
    }
};

type Class = {
    _id: string;
    section: string;
    academicStartYear: number;
    department: string;
    semester: number;
    students: string[];
};

const Mentees: React.FC = () => {
    const data = localStorage.getItem('userData')
    let user:any = null;
    if(data){
        user = JSON.parse(data);
    }
    const navigate = useNavigate();
    const [mentor, setMentor] = useState<Mentor | null>(user);
    const [assignedClass, setAssignedClass] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if(mentor?.teacherId){
                    const classRes = await apiCLient.get(GET_MY_CLASSES_ROUTE);
                    setAssignedClass(classRes.data.data[0])
                }
                // else if(mentor?.adminId){
                //     const classRes = await apiCLient.get(GET_MY_CLASSES_ROUTE);
                //     setClasses(classRes.data?.data || []);
                // }   
            } catch (err) {
                console.error("Error fetching mentor/classes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">My Dashboard</h1>

            {mentor && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100/50">
                            {mentor.teacherId.firstName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {mentor.teacherId.firstName} {mentor.teacherId.lastName}
                            </h2>
                            <p className="text-gray-500 font-medium text-sm mt-0.5">{mentor.teacherId.email}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                            {mentor.teacherId.department}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                            {mentor.teacherId.gender}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
                            ID: {mentor.employeeId}
                        </span>
                    </div>
                </div>
            )}

            {/* Classes List */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">My Assigned Class</h3>
            {assignedClass?._id ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        onClick={() => navigate(`/class/${assignedClass._id}`)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {assignedClass.section}
                                </h4>
                                <p className="text-sm text-gray-500 font-medium mt-1">{assignedClass.department}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                                Sem {assignedClass.semester}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Start Year</p>
                                <p className="text-sm font-semibold text-gray-900">{assignedClass.academicStartYear}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Students</p>
                                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {assignedClass.students.length} Enrolled
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-12 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-center flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">No Custom Class Yet</h4>
                        <p className="text-gray-500 font-medium mt-1">You haven't been assigned to a class. Please contact the administrator.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mentees;
