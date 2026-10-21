import { apiCLient } from "@/service/app";
import { Dot } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

interface StudentProfile {
    _id: string;
    studentId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        gender: string;
        department: string;
    };
    admissionNo: string;
    yearOfAdmission: number;
    program: string;
    stressAlert:boolean;
}
interface Class {
    _id: string;
    section: string;
    department: string;
    semester: number;
    academicStartYear: number;
    mentorId?: Mentor;
    students: StudentProfile[];
    subjects: any
}
const StudentList: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await apiCLient.get(`/admin/class/${id}`);
                setCls(res.data.data);
                console.log(res.data.data)
            } catch (err) {
                console.error(err);
            } finally {

            }
        }
        fetchStudents();
    }, []);
    return (
        <div className="p-8 max-w-8xl mx-auto">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 ">
                <div className="bg-white shadow rounded-xl p-6 hover:shadow-xl transition-all">
                    <h2 className="text-2xl font-bold mb-4">Class Information</h2>
                    <div className="space-y-2 text-gray-700 pl-3">
                        <p>
                            <span className="font-medium">Section:</span> {cls.section}
                        </p>
                        <p>
                            <span className="font-medium">Department:</span> {cls.department}
                        </p>
                        <p>
                            <span className="font-medium">Semester:</span> {cls.semester}
                        </p>
                        <p>
                            <span className="font-medium">Academic Year:</span>{" "}
                            {cls.academicStartYear}
                        </p>
                        <p>
                            <span className="font-medium">Students:</span>{" "}
                            {cls.students?.length || 0}
                        </p>
                        <p>
                            <span className="font-medium">Subjects:</span>{" "}
                            {Array.isArray(cls.subjects)
                                ? cls.subjects.join(", ")
                                : "N/A"}
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow rounded-xl p-6 hover:shadow-xl transition-all">
                    <h2 className="text-2xl font-bold mb-4">Mentor Information</h2>
                    {cls.mentorId ? (
                        <div className="space-y-2 text-gray-700 pl-3">
                            <p>
                                <span className="font-medium">Name:</span>{" "}
                                {cls.mentorId.teacherId.firstName} {cls.mentorId.teacherId.lastName || ""}
                            </p>
                            <p>
                                <span className="font-medium">Email:</span>{" "}
                                {cls.mentorId.teacherId.email}
                            </p>
                            <p>
                                <span className="font-medium">Department:</span>{" "}
                                {cls.mentorId.teacherId.department}
                            </p>
                            <p>
                                <span className="font-medium">Employee ID:</span>{" "}
                                {cls.mentorId.employeeId}
                            </p>
                            <p>
                                <span className="font-medium">Designation:</span>{" "}
                                {cls.mentorId.designation || "Not Assigned"}
                            </p>
                            <p>
                                <span className="font-medium">Specialization:</span>{" "}
                                {cls.mentorId.specialization?.length > 0
                                    ? cls.mentorId.specialization.join(", ")
                                    : "N/A"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No mentor assigned</p>
                    )}
                </div>
            </div>
            <div className="bg-white p-6 m-5 rounded-4xl shadow hover:shadow-lg transition-all">
                <h1 className="text-3xl font-semibold mb-6">Students Directory </h1>
                {cls?.students.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#d7eafc] text-left border-b-2 border-[#50769a]">
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Admission No.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cls.students.map((s) => (
                                <tr onClick={() => {
                                    navigate(`/counselor/student/${s.studentId._id}`);
                                }} key={s._id} className={`border-t cursor-pointer transition-colors ${
                                    s.stressAlert 
                                        ? "bg-red-50 hover:bg-red-100" 
                                        : "hover:bg-[#f4faff]"
                                }`}>
                                    <td className="p-2 border ">
                                        {s.studentId.firstName} {s.studentId.lastName}
                                        {s.stressAlert ? 
                                            <Dot color="red" size={30} className="inline"/>
                                            : <></>
                                        }
                                    </td>
                                    <td className="p-2 border">{s.studentId.email}</td>
                                    <td className="p-2 border">{s.admissionNo || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">No students enrolled</p>
                )}
            </div>
        </div>
    );
};

export default StudentList;
