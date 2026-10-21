import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiCLient, CREATE_CLASS } from "@/service/app";
import toast from "react-hot-toast";

export default function EditClass() {
    const {id} = useParams();
    const [section, setSection] = useState("");
    const [academicStartYear, setAcademicStartYear] = useState<string | "">("");
    const [semester, setSemester] = useState<string | "">("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<String>("")
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch existing class details using the id
        const fetchClassDetails = async () => {
            try {
                setLoading(true);
                const res = await apiCLient.get(`/admin/class/${id}`);
                const cls = res.data.data;
                setSection(cls.section);
                setAcademicStartYear(cls.academicStartYear.toString());
                setSemester(cls.semester.toString());
            } catch (error: any) {
                alert(error.response?.data?.message || "Error fetching class details");
                toast.error("Error fetching class details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchClassDetails();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!section || !academicStartYear || !semester) {
            setError("All the fields are required.")
            return;
        }

        try {
            setLoading(true);
            const res = await apiCLient.patch(
                '/admin/class/update/' + id,
                {
                    section,
                    academicStartYear: Number(academicStartYear),
                    semester: Number(semester),
                }
            );

            toast.success("Class Updated successfully");
            navigate("/class/" + id);
        } catch (error: any) {
            alert(error.response?.data?.message || "Error updating class");
            toast.error("Error while updating class");
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
            <div className="p-6 max-w-lg mx-auto">
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Update Class</h3>
                    <p className="text-gray-500 mt-2 font-medium">Modify the details of this class below.</p>
                </div>
                
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6"
                >
                    {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Section</label>
                        <input
                            type="text"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            placeholder="e.g. IT1, CSDS2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Academic Start Year</label>
                        <input
                            type="number"
                            value={academicStartYear}
                            onChange={(e) => setAcademicStartYear(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            placeholder="e.g. 2025"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Semester</label>
                        <input
                            type="number"
                            min={1}
                            max={8}
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            placeholder="1 - 8"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating Class...
                            </>
                        ) : "Update Class"}
                    </button>
                </form>
            </div>
        </div>
    );
}
