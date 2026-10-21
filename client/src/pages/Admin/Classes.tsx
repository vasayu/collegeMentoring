import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiCLient, GET_ALL_CLASS } from "@/service/app";
import toast from "react-hot-toast";
import { ArrowDownNarrowWideIcon, Building2, ChevronDown, ChevronUp, PencilIcon, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

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

const DEPARTMENTS = ['All', 'IT', 'CSE', 'ECE', 'EE', 'EEE', 'MECH', 'CIVIL'];

export default function Allotment() {
    const [classes, setClasses] = useState<Class[]>([])
    const [filterSem, setFilterSem] = useState("")
    const [deptFilter, setDeptFilter] = useState("All")
    const [loading, setLoading] = useState(false)

    const user = useSelector((state: any) => state.auth?.userData);
    const role = user?.adminId?.role ?? user?.role;

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

    // Apply department filter for Master Admin
    const filtered = (role === 4 && deptFilter !== 'All')
        ? classes.filter(c => c.department === deptFilter)
        : classes;

    const firstYearClasses = filtered.filter(c => c.semester <= 2);
    const secondYearClasses = filtered.filter(c => c.semester > 2 && c.semester <= 4);
    const thirdYearClasses = filtered.filter(c => c.semester > 4 && c.semester <= 6);
    const fourthYearClasses = filtered.filter(c => c.semester > 6 && c.semester <= 8);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-5">
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Classes</h3>
                    <p className="text-gray-500 mt-1 font-medium text-sm">
                        {role === 4 ? "Viewing classes across all departments." : "Manage class allotments and assignments."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {role === 4 && (
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400 shrink-0" />
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold appearance-none bg-white"
                            >
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                            </select>
                        </div>
                    )}
                    <Link
                        to="/admin/create-class"
                        className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 shadow-sm transition-all whitespace-nowrap"
                    >
                        + Create Class
                    </Link>
                </div>
            </div>

            <div className="space-y-4 w-full">
                {expandableClasses({ classes: fourthYearClasses, year: "Fourth",setClasses})}
                {expandableClasses({ classes: thirdYearClasses, year: "Third" ,setClasses})}
                {expandableClasses({ classes: secondYearClasses, year: "Second", setClasses })}
                {expandableClasses({ classes: firstYearClasses, year: "First", setClasses })}
            </div>
        </div>
    )
}

const expandableClasses = ({ classes, year,setClasses }: { classes: Class[], year: string, setClasses: React.Dispatch<React.SetStateAction<Class[]>> }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e: any, classId: string) => {
        e.stopPropagation(); // ✅ Prevent row click
        try {
            setLoading(true);
            await apiCLient.post(`/mentors/remove-class`, { classId });
            setClasses((prev) => prev.filter((c) => c._id !== classId));
            toast.success("Class removed successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove class");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
            <div 
                className={`flex py-4 px-6 justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors ${isOpen ? 'border-b border-gray-100 bg-gray-50/50' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {year.charAt(0)}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{`${year} Year`}</p>
                        <p className="text-sm font-medium text-gray-500">{classes.length} {classes.length === 1 ? 'Class' : 'Classes'}</p>
                    </div>
                </div>
                <div className="text-gray-400 p-1 rounded-full hover:bg-gray-200 transition-colors">
                    {!isOpen && <ChevronDown size={20} />}
                    {isOpen && <ChevronUp size={20} />}
                </div>
            </div>
            {isOpen &&
                <div className="p-0 overflow-x-auto">
                    {classes.length > 0 ? 
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Year</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign Mentor</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {classes.map((cls) => (
                                <tr
                                    key={cls._id}
                                    className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                                    onClick={() => navigate(`/class/${cls._id}`)}
                                >
                                    <td className="py-3 px-6 font-semibold text-gray-900">{cls.section}</td>
                                    <td className="py-3 px-6 text-sm text-gray-600 font-medium">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                                            {cls.department}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-sm text-gray-600 font-medium">Sem {cls.semester}</td>
                                    <td className="py-3 px-6 text-sm text-gray-600 bg-gray-50/30">{cls.academicStartYear}</td>
                                    <td className="py-3 px-6 text-sm text-gray-800 font-medium">
                                        {cls?.mentorId?.teacherId ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {cls?.mentorId?.teacherId?.firstName.charAt(0)}{cls?.mentorId?.teacherId?.lastName?.charAt(0)}
                                                </div>
                                                <span>{cls?.mentorId?.teacherId?.firstName} {cls.mentorId?.teacherId?.lastName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Not Assigned</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-sm font-semibold text-gray-900">{cls.students.length}</td>
                                    <td className="py-3 px-6">
                                        <div className="flex flex-row items-center justify-end gap-2">
                                            <button
                                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/class/${cls._id}/edit`);
                                                }}>
                                                <PencilIcon size={18} />
                                            </button>
                                            <button
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                onClick={(e) => handleDelete(e, cls._id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    :
                        <div className="w-full flex items-center justify-center py-12 bg-gray-50/30">
                            <p className="text-gray-500 font-medium">No classes found for this year.</p>
                        </div>
                    }
                </div>
            }
        </div>
    )

}