import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiCLient, GET_ALL_CLASS } from "@/service/app";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface Mentor {
    _id: string
    teacherId: {
        firstName: string
        lastName?: string
        email: string
        department: string
    }
    employeeId: string
    specialization: string[]
    designation?: string
}

type Class = {
    _id: string
    section: string
    department: string
    semester: number
    academicStartYear: number
    mentorId?: Mentor
    students: any
}

export default function CounselorClasses() {
    const [classes, setClasses] = useState<Class[]>([])
    const [filterSem, setFilterSem] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const classesRes = await apiCLient.get(GET_ALL_CLASS)
                setClasses(classesRes.data?.data)
            } catch (err) {
                console.error(err)
                toast.error("Error fetching data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredClasses = classes.filter((c) =>
        filterSem ? c.semester.toString() === filterSem : true
    )

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classes Directory</h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm">View details of all classes across different semesters.</p>
                </div>
                
                <div className="flex">
                    <select
                        className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl min-w-[200px] text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                        value={filterSem}
                        onChange={(e) => setFilterSem(e.target.value)}
                    >
                        <option value="">All Semesters</option>
                        {[...new Set(classes.map((c) => c.semester))].map((sem) => (
                            <option key={sem} value={sem}>
                                Semester {sem}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Year</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Mentor</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClasses.map((cls) => (
                                <tr
                                    key={cls._id}
                                    className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                                    onClick={() => navigate(`/counselor/class/${cls._id}`)}
                                >
                                    <td className="py-4 px-6 font-semibold text-gray-900">{cls.section}</td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                                            {cls.department}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">Sem {cls.semester}</td>
                                    <td className="py-4 px-6 text-sm text-gray-600">{cls.academicStartYear}</td>
                                    <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                                        {cls?.mentorId?.teacherId ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {cls.mentorId.teacherId.firstName.charAt(0)}{cls.mentorId.teacherId.lastName?.charAt(0)}
                                                </div>
                                                <span>{cls.mentorId.teacherId.firstName} {cls.mentorId.teacherId.lastName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {cls.students.length}
                                    </td>
                                </tr>
                            ))}

                            {filteredClasses.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-12 text-center text-gray-500 font-medium bg-gray-50/30"
                                    >
                                        No classes found for the selected view.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
