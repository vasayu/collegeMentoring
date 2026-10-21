// src/pages/Attendance.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
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
type Props = {
    studentId?: string;
};

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

export default function Attendance({ studentId }: Props) {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await apiCLient.get(`/response/student/${studentId}`);
                setMetrics(data.data);
            } catch (err) {
                console.log(err);
            } finally {

            }
        }
        getData();
    }, []);
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
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="">
                <h2 className="text-xl font-semibold text-slate-800">Survey Report</h2>
                {metrics ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div>
                        <h3 className="font-semibold mb-4">Stress</h3>
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
                    <div className="bg-white p-6">
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
        </div>
    );
}
