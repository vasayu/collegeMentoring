import { apiCLient } from "@/service/app";
import { Dot, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StudentProfile {
    _id: string;
    studentId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    admissionNo: string;
    semester?: number;
    stressAlert: boolean;
}

const StudentList: React.FC = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [search, setSearch] = useState("");
    const [semester, setSemester] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setStudents([]);
            const payload: any = {};
            if (search.trim()) payload.search = search.trim();
            if (semester !== "all") payload.semester = semester;

            const res = await apiCLient.post("/admin/alert-students", payload);
            console.log("Fetched students:", res);
            setStudents(res.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50/50 pb-10 pt-20">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white shadow-sm border border-gray-100 z-50"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
            </button>
            <div className="p-8 max-w-8xl mx-auto">
            <div className="bg-white p-6 m-5 rounded-4xl shadow">
                <h1 className="text-3xl font-semibold mb-6">
                    Students Directory
                </h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search name / email / admission no"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-500 focus:outline-0 focus:border-black rounded-lg w-72"
                    />

                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>
                                Semester {sem}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={fetchStudents}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {/* Table */}
                {students.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#d7eafc] border-b-2 border-[#50769a]">
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Admission No.</th>
                                <th className="p-2 border">Semester</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr
                                    key={s._id}
                                    onClick={() =>
                                        navigate(
                                            `/counselor/student/${s.studentId._id}`
                                        )
                                    }
                                    className={`border-t cursor-pointer transition-colors ${
                                        s.stressAlert 
                                            ? "bg-red-50 hover:bg-red-100" 
                                            : "hover:bg-[#f4faff]"
                                    }`}
                                >
                                    <td className="p-2 border">
                                        {s.studentId.firstName}{" "}
                                        {s.studentId.lastName}
                                        {s.stressAlert && (
                                            <Dot
                                                color="red"
                                                size={30}
                                                className="inline"
                                            />
                                        )}
                                    </td>
                                    <td className="p-2 border">
                                        {s.studentId.email}
                                    </td>
                                    <td className="p-2 border">
                                        {s.admissionNo || "-"}
                                    </td>
                                    <td className="p-2 border">
                                        {s.semester || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !loading && (
                        <p className="text-gray-500">
                            No students found
                        </p>
                    )
                )}
            </div>
            </div>
        </div>
    );
};

export default StudentList;
