import React, { useEffect, useState } from "react";
import { apiCLient, GET_ALL_RESPONSES_ROUTE, GET_STUDENT_CHART_ROUTE } from "@/service/app";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    PolarGrid,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,

} from "recharts";
import { useParams } from "react-router-dom";
import { Building2, IdCard, Mail, User } from "lucide-react";

interface Student {
    _id: string;
    studentId: {
        firstName: string,
        lastName: string,
        department: string,
        role: number,
        email: string
    },
    admissionNo: string;
    yearOfAdmission?: number;
    program: string;
}

interface Metrics {
    _id: string;
    stressIndex: number;
    mentalAbility: {
        logical: number;
        memory: number;
        learning: number;
        concentration: number;
        creativity: number;
    };
}

const CounselorDashboard = () => {
    const { id } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    useEffect(() => {
        const getData = async () => {
            try {
                const res = await apiCLient.get(`/mentors/student/${id}`);
                console.log(res);
                setStudent(res.data.data);
                const data = await apiCLient.get(`/response/student/${id}`);
                setMetrics(data.data);
            } catch (err) {
                console.log(err);
            } finally {

            }
        }
        getData();
    }, [])
    const lineData = [
        { name: "Stress Index", value: metrics?.stressIndex },
    ];
    const radarData = [
        { subject: "Logical", A: metrics?.mentalAbility.logical, fullMark: 5 },
        { subject: "Memory", A: metrics?.mentalAbility.memory, fullMark: 5 },
        { subject: "Learning", A: metrics?.mentalAbility.learning, fullMark: 5 },
        { subject: "Concentration", A: metrics?.mentalAbility.concentration, fullMark: 5 },
        { subject: "Creativity", A: metrics?.mentalAbility.creativity, fullMark: 5 },
    ];
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-12">
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 my-5 w-full mx-auto border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {student?.studentId.firstName} {student?.studentId?.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {student?.program ? student?.program : "-"}
                        </p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{student?.studentId.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{student?.studentId.department}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Admission number: {student?.admissionNo}</span>
                    </div>
                </div>
            </div>
            {/* Line Chart */}
            {metrics ? <div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-semibold mb-4">Stress vs Composite Ability</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart
                            data={lineData}
                            startAngle={180}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="100%"
                            barSize={20}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 5]}
                                tick={false}
                                angleAxisId={0}
                            />
                            <RadialBar
                                dataKey="value"
                                fill="#ef4444"
                                cornerRadius={10}
                                background
                            />
                            <Tooltip />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    <p className="text-center text-gray-700 text-2xl font-bold">
                        {lineData[0].value}/5
                    </p>
                </div>

                {/* Polar/Radar Chart */}
                <div className="bg-white p-6  ">
                    <h3 className="font-semibold mb-4">Mental Abilities Radar</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} />
                            <Radar
                                name="Score"
                                dataKey="A"
                                stroke="#ff7f0e"
                                fill="#ff7f0e"
                                fillOpacity={0.6}
                            />
                            <Legend />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div> : <div>
                <h1>No metrics Found</h1>
            </div>}
        </div>
    );
};

export default CounselorDashboard;




