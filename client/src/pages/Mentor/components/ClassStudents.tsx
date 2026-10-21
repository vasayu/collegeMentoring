import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AddStudentOverlay from './AddStudent';
import GradeEditSheet from './GradeEditSheet';
import { EyeIcon, Trash2, View, ArrowUpDown, ArrowUp, ArrowDown, TableProperties } from 'lucide-react';
import { apiCLient } from '@/service/app';
import toast from 'react-hot-toast';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<any>();

type Props = {
    classId: string;
    students: {
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
    }[];
    onStudentUpdated: () => void;
}

const ClassStudents = ({ classId, students, onStudentUpdated }: Props) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const [addStudentDialogue, setAddStudentDialogue] = useState(false);
    const [deleteAllDialogue, setDeleteAllDialogue] = useState(false);
    const [editModeOpen, setEditModeOpen] = useState(false);

    // Tanstack table sorting state
    const [sorting, setSorting] = useState<any>([]);

    const filteredStudents = React.useMemo(() => students.filter((s) => {
        const q = search.toLowerCase();

        return (
            s.studentId.firstName.toLowerCase().includes(q) ||
            s.studentId.lastName?.toLowerCase().includes(q) ||
            s.studentId.email.toLowerCase().includes(q) ||
            s.admissionNo?.toLowerCase().includes(q)
        );
    }), [students, search]);

    // Column Definitions for tanstack table
    const columns = React.useMemo(() => [
        columnHelper.accessor('admissionNo', {
            header: 'Admission No.',
            cell: info => <span className="text-gray-700 font-medium">{info.getValue() || "-"}</span>,
        }),
        columnHelper.accessor(row => `${row.studentId.firstName} ${row.studentId.lastName || ''}`.trim(), {
            id: 'name',
            header: 'Name',
            cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>,
        }),
        columnHelper.accessor('studentId.email', {
            header: 'Email',
            cell: info => <span className="text-gray-600">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: 'attendance',
            header: 'Attendance',
            cell: (info) => <AttendanceCell studentProfileId={info.row.original._id} />
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (info) => (
                <StudentActionCell s={info.row.original} classId={classId} onStudentUpdated={onStudentUpdated} />
            )
        })
    ], [classId, onStudentUpdated]);

    // Table instance
    const table = useReactTable({
        data: filteredStudents,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all'>
            {/* Delete All Students dialogue */}
            {deleteAllDialogue && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90vw]">
                        <h2 className="text-2xl font-bold mb-3 text-red-600 flex items-center gap-2">
                            <Trash2 size={24} /> Delete All Students
                        </h2>
                        <div className="mb-6 text-gray-700 bg-red-50 p-4 rounded-lg border border-red-100">
                            <p className="font-semibold text-red-800 mb-2">Warning: This action cannot be undone.</p>
                            <p className="text-sm">You are about to permanently delete all <strong>{students.length}</strong> students from this class.</p>
                            <ul className="text-sm list-disc pl-5 mt-2 text-red-700/80">
                                <li>User accounts will be deleted</li>
                                <li>All grade records will be wiped</li>
                                <li>Student profiles will be removed</li>
                            </ul>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteAllDialogue(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await apiCLient.post('/mentors/delete-all-students-from-class', { classId });
                                        toast.success('All students deleted successfully');
                                        onStudentUpdated();
                                        setDeleteAllDialogue(false);
                                    } catch (err) {
                                        console.log("Error wiping all students", err);
                                        toast.error('Failed to delete students');
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm shadow-red-600/20"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Student diaglogue box */}
            {
                addStudentDialogue && <AddStudentOverlay
                    onClose={() => setAddStudentDialogue(false)}
                    classId={classId}
                    onStudentUpdated={onStudentUpdated}
                />
            }
            {/* Edit Mode Sheet */}
            {editModeOpen && (
                <GradeEditSheet classId={classId} onClose={() => setEditModeOpen(false)} />
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    Students Enrolled
                    <span className="ml-3 px-3 py-1 bg-blue-50 border border-blue-100/50 text-blue-700 rounded-xl text-sm font-bold">
                        {filteredStudents.length}
                    </span>
                </h3>

                <div className="flex gap-3 flex-wrap">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl w-64 md:w-72 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-sm"
                        />
                    </div>

                    {students.length > 0 && (
                        <button
                            onClick={() => setEditModeOpen(true)}
                            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm shadow-violet-600/20 hover:bg-violet-700 hover:shadow-violet-600/30 transition-all active:scale-[0.98] whitespace-nowrap"
                        >
                            <TableProperties size={16} />
                            Edit Mode
                        </button>
                    )}
                    <button
                        onClick={() => setAddStudentDialogue(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all active:scale-[0.98] whitespace-nowrap"
                    >
                        + Add Students
                    </button>
                    {students.length > 0 && (
                        <button
                            onClick={() => setDeleteAllDialogue(true)}
                            className="bg-white border-2 border-red-100 text-red-600 px-4 py-2 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-2 group"
                        >
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                            Wipe Class
                        </button>
                    )}
                </div>
            </div>
            {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className={`py-3 px-4 text-sm font-semibold text-gray-700 select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: <ArrowUp className="w-3.5 h-3.5 text-gray-600" />,
                                                        desc: <ArrowDown className="w-3.5 h-3.5 text-gray-600" />,
                                                    }[header.column.getIsSorted() as string] ?? (
                                                            header.column.getCanSort() ? <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-50" /> : null
                                                        )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="py-3 px-4 text-sm text-gray-800">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : <p className="text-gray-500 py-4 text-center border-t border-gray-100">No students enrolled in this class.</p>}

        </div>
    )
}

const AttendanceCell = ({ studentProfileId }: { studentProfileId: string }) => {
    const [stats, setStats] = React.useState<{ attended: number; total: number } | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;
        const fetchAttendance = async () => {
            try {
                const res = await apiCLient.post('/users/get-grade', { studentId: studentProfileId });
                const gradeSheets = res.data?.data || [];
                let total = 0;
                let attended = 0;
                
                gradeSheets.forEach((sheet: any) => {
                    if (sheet.subjects) {
                        sheet.subjects.forEach((subj: any) => {
                            if (subj.attendance) {
                                ['cia1', 'cia2', 'cia3'].forEach((cia) => {
                                    if (subj.attendance[cia]) {
                                        attended += subj.attendance[cia].attended || 0;
                                        total += subj.attendance[cia].total || 0;
                                    }
                                });
                            }
                        });
                    }
                });
                
                if (isMounted) {
                    setStats({ attended, total });
                }
            } catch (error) {
                console.error("Error fetching grade/attendance", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchAttendance();
        
        return () => { isMounted = false; };
    }, [studentProfileId]);

    if (loading) return <span className="text-gray-400 font-medium text-xs animate-pulse">Loading...</span>;
    if (!stats || stats.total === 0) return <span className="text-gray-400 font-medium">—</span>;

    const percentage = Math.round((stats.attended / stats.total) * 100);
    
    let colorClass = "text-gray-500";
    if (percentage >= 80) colorClass = "text-emerald-600 font-bold";
    else if (percentage >= 70) colorClass = "text-amber-600 font-bold";
    else colorClass = "text-rose-600 font-bold";

    return (
        <span className="text-gray-800 font-medium">
            {stats.attended} / {stats.total} <span className={`ml-1 ${colorClass}`}>({percentage}%)</span>
        </span>
    );
};

const StudentActionCell = ({ s, classId, onStudentUpdated }: { s: any, classId: string, onStudentUpdated: any }) => {
    const navigate = useNavigate();
    const [deleteStudentDialogue, setDeleteStudentDialogue] = React.useState(false);

    const handleRemoveStudentFromClass = async (studentId: string) => {
        const payload = {
            studentId: s._id,
            classId: classId,
        };
        try {
            const res = await apiCLient.post('/mentors/remove-student-from-class', payload);
            toast.success('Student removed from class successfully');
            onStudentUpdated();
            setDeleteStudentDialogue(false);
        } catch (err) {
            console.log("Error on removing student from class", err);
            toast.error('Failed to remove student from class');
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        const payload = {
            studentId: s._id,
            classId: classId,
        }

        try {
            const res = await apiCLient.post('/mentors/delete-student', payload);
            toast.success('Student deleted successfully');
            onStudentUpdated();
            setDeleteStudentDialogue(false);
        } catch (err) {
            console.log("Error on deleting student", err);
            toast.error('Failed to delete student');
        }
    }

    return (
        <>
            {/* Delete Student  */}
            {
                deleteStudentDialogue && (
                    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
                            <p className="mb-6 text-gray-600">Are you sure you want to remove this student from the class?</p>
                            <div className="flex flex-col justify-end gap-2">
                                <button
                                    onClick={() => handleRemoveStudentFromClass(s._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Remove From Class
                                </button>
                                <button
                                    onClick={() => handleDeleteStudent(s._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    Delete Student
                                </button>
                                <button
                                    onClick={() => setDeleteStudentDialogue(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="flex gap-2">
                <Trash2
                    onClick={(e) => { e.stopPropagation(); setDeleteStudentDialogue(true); }}
                    className='p-1 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer'
                    size={32}
                />
                <EyeIcon
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/${s?.studentId?._id}`); }}
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-300"
                    size={32}
                />
            </div>
        </>
    )
}

export default ClassStudents
