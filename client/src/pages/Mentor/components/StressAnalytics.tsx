import { apiCLient, GET_STRESS_DISTRIBUTION_ROUTE } from '@/service/app';
import { Dot, AlertTriangle, Users, BarChart3 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface StudentStressData {
    profileId: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    admissionNo: string;
    stressAlert: boolean;
    stressIndex: number | null;
}

interface StressDistributionData {
    totalStudents: number;
    surveysCompleted: number;
    distribution: { [key: string]: number };
    students: StudentStressData[];
}

const StressAnalytics = ({ classId }: { classId: string }) => {
    const [data, setData] = useState<StressDistributionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'alerts' | 'all'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStressData = async () => {
            try {
                setLoading(true);
                const response = await apiCLient.get(GET_STRESS_DISTRIBUTION_ROUTE(classId));
                setData(response.data.data);
                // If there are alerts, maybe default to alerts view, otherwise show all
                const alerts = response.data.data.students.filter((s: any) => s.stressAlert);
                if (alerts.length > 0) setViewMode('alerts');
            } catch (error) {
                console.error("Error fetching stress distribution:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStressData();
    }, [classId]);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500 font-medium tracking-tight">Analyzing stress patterns...</span>
            </div>
        );
    }

    const chartData = [
        { level: '1', count: data?.distribution['1'] || 0, label: 'Very Low' },
        { level: '2', count: data?.distribution['2'] || 0, label: 'Low' },
        { level: '3', count: data?.distribution['3'] || 0, label: 'Moderate' },
        { level: '4', count: data?.distribution['4'] || 0, label: 'High' },
        { level: '5', count: data?.distribution['5'] || 0, label: 'Very High' },
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#7f1d1d'];
    const alertedStudents = data?.students.filter(s => s.stressAlert) || [];
    const displayedStudents = viewMode === 'alerts' ? alertedStudents : (data?.students || []);

    const hasData = (data?.surveysCompleted || 0) > 0;

    return (
        <div className="w-full space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{data?.totalStudents}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Surveys Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{data?.surveysCompleted}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">High Stress Alerts</p>
                        <p className="text-2xl font-bold text-gray-900">{alertedStudents.length}</p>
                    </div>
                </div>
            </div>

            {/* Stress Distribution Chart */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Stress Level Distribution
                    </h2>
                </div>

                {hasData ? (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="level"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    label={{ value: 'Stress Level (1-5)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: number, name: string, props: any) => [`${value} Students`, `Level ${props.payload.level} (${props.payload.label})`]}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-20 border border-gray-50 bg-gray-50/20 rounded-2xl">
                        <p className="text-gray-400 font-medium italic">No survey data collected for this class yet.</p>
                    </div>
                )}
            </div>

            {/* Students Table */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        {viewMode === 'alerts' ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : <Users className="w-5 h-5 text-blue-600" />}
                        {viewMode === 'alerts' ? 'High Risk Students' : 'Class Stress Status'}
                    </h2>
                    
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                        <button 
                            onClick={() => setViewMode('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All Students
                        </button>
                        <button 
                            onClick={() => setViewMode('alerts')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'alerts' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Alerts ({alertedStudents.length})
                        </button>
                    </div>
                </div>

                {displayedStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Current Stress</th>
                                        <th className="py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Admission No.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {displayedStudents.map((s) => (
                                        <tr 
                                            onClick={() => navigate(`/counselor/student/${s.studentId}`)} 
                                            key={s.profileId} 
                                            className="cursor-pointer hover:bg-gray-50 transition-all group"
                                        >
                                            <td className="py-4 px-4 font-medium text-gray-900 line-clamp-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                        !s.stressIndex ? 'bg-gray-100 text-gray-400' :
                                                        s.stressIndex >= 4 ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{s.firstName} {s.lastName}</span>
                                                        {s.stressAlert && <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">Requires Attention</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-500 text-sm">{s.email}</td>
                                            <td className="py-4 px-4 text-center">
                                                {s.stressIndex ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        s.stressIndex >= 4 ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                                        s.stressIndex >= 3 ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    }`}>
                                                        Level {s.stressIndex}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic">Not submitted</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-800 text-sm font-semibold text-right">{s.admissionNo || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{viewMode === 'alerts' ? 'No Active Alerts' : 'No Students'}</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">
                            {viewMode === 'alerts' ? 'No students have triggered high-stress alerts currently.' : 'No students are currently enrolled in this section.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StressAnalytics;
