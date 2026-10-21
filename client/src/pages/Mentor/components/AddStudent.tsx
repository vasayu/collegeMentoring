import { useState } from "react"
import { X, Search } from "lucide-react"
import { apiCLient, apiUploadClient, ASSIGN_CLASS_TO_STUDENT_ROUTE } from "@/service/app"
import axios from "axios";
import toast from "react-hot-toast";

interface Student {
    _id: string;
    student: {
        firstName: string;
        lastName?: string;
        email: string;
        department: string;
    };
    admissionNo: string;
    semester: number;
    yearOfAdmission: number;
}

interface AddStudentProps {
    onClose: () => void
    classId: string
    onStudentUpdated: () => void
}

export default function AddStudentOverlay({ onClose, classId,onStudentUpdated }: AddStudentProps) {
    const [query, setQuery] = useState("");
    const [searched, setSearch] = useState(false);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [method,setMethod] = useState<"search" | "import">("search");
    const [file,setFile] = useState<File | null>(null);
    const [error,setError] = useState<String>("");
    const [importing,setImporting] = useState<boolean>(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        try {
            setLoading(true);
            setSearch(true);
            const res = await apiCLient.post(`/users/get-student-by-admission-no`, { query });
            console.log(res);
            if (res.data && res.data.data) {
                setStudent(res.data.data);
            } else {
                setStudent(null);
            }
        } catch (err) {
            console.error(err);
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async() => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        };

        console.log("file: ", file)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("classId", classId);

        try {
            setImporting(true);
            const res = await apiUploadClient.post(
                `/users/create-students-by-upload`,
                formData
            );
            toast.success("Students imported successfully");
            onStudentUpdated();
            onClose();
        }catch(err) {
            console.error(err);
        }finally {
            setImporting(false);
        }
    }

    const handleSelect = async (studentId: string, classId: string) => {
        try {
            await apiCLient.post(ASSIGN_CLASS_TO_STUDENT_ROUTE, { studentId, classId });
        } catch (err) {
            console.log(err);
        } finally {
            onClose();
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">

                <div className="grid grid-cols-2 border-blue-500 border-b-2">
                    <button 
                        className={method === "search" ? "py-4 bg-blue-600 text-white" : "py-4 cursor-pointer"}
                        onClick={() => setMethod("search")}
                        >
                            By Searching
                    </button>
                    <button 
                        className={method === "import" ? "py-4 bg-blue-600 text-white" : "py-4 cursor-pointer"}
                        onClick={() => setMethod("import")}
                        >
                            By import
                    </button>
                </div>  

                {error && <div className="p-4 pb-0 text-red-600">{error}</div>}

                {/* Add by import */}
                {method === "import" && <div className="py-3 px-6">
                    <h2 className="text-2xl font-semibold mb-4">Import Students</h2>
                    <p className="mb-4">To import students, please upload a excel file with the following columns:</p>
                    <ul className="list-disc list-inside mb-4">
                        <li>S.No.</li>
                        <li>Section</li>
                        <li>Adm.No.</li>
                        <li>Name</li>
                        {/* Name = First Name + last Name 
                            Password = admission number which they can change later
                        */}
                        <p className="text-sm text-gray-700">The password is set to the admission number by default.</p>
                    </ul>
                    <input
                        type="file"
                        className="border rounded-lg p-2 w-full mb-4"
                        onChange={(e) => {
                            const files = e.target.files;
                            if (!files || files.length===0) return; 
                            setFile(files[0])}}
                    />
                    <button
                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg ` + (importing ? "cursor-not-allowed" : "hover:bg-blue-600")}
                        onClick={uploadFile}
                        disabled={importing}
                    >
                        {importing ? "Importing..." : "Upload and Import"}
                    </button>
                </div>}

                {/* Add by admission number */}
                {method === "search" && <div>
                    <div className="flex items-center border-b p-4 space-x-2">
                        <input
                            type="text"
                            placeholder="Enter student name/email/admission no..."
                            className="flex-1 focus:outline-none px-3 py-2 text-lg border border-gray-600 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            onClick={handleSearch}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
                        >
                            <Search size={18} /> Search
                        </button>
                        {/* <button
                            onClick={onClose}
                            className="ml-2 text-gray-500 hover:text-black"
                        >
                            <X size={22} />
                        </button> */}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <p className="p-4 text-center text-gray-500">Searching...</p>
                        ) : student ? (
                            <ul>
                                <li
                                    key={student._id}
                                    className="p-4 hover:bg-gray-100 cursor-pointer transition"
                                    onClick={() => handleSelect(student._id, classId)}
                                >
                                    <p className="font-medium">
                                        {student.student.firstName} {student.student.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {student.admissionNo} - {student.student.email}
                                    </p>
                                </li>
                            </ul>
                        ) : (
                            searched && (
                                <p className="p-4 text-center text-gray-500">No student found</p>
                            )
                        )}
                    </div>
                </div>}
            </div>
        </div>
    )
}
