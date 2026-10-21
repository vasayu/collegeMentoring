import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiCLient, CREATE_CLASS } from "@/service/app";
import toast from "react-hot-toast";

export default function CreateClass() {
  const [section, setSection] = useState("");
  const [academicStartYear, setAcademicStartYear] = useState<string | "">("");
  const [semester, setSemester] = useState<string | "">("");
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState<String>("")
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section || !academicStartYear || !semester) {
      setError("All the fields are required.")
      return;
    }
    if(isNaN(Number(academicStartYear)) || academicStartYear.length !== 4){
      setError("Please enter a valid academic start year");
      return;
    }
    if (isNaN(Number(semester)) || Number(semester) < 1 || Number(semester) > 8) {
      setError("Semester must be a number between 1 and 8");
      return;
    }
    setError("");

    try {
      setLoading(true);
      const res = await apiCLient.post(
        CREATE_CLASS,
        {
          section,
          academicStartYear: Number(academicStartYear),
          semester: Number(semester),
        }
      );

      toast.success("Class created successfully");
      navigate("/admin/classes");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating class");
      toast.error("Error while creating class");
    } finally {
      setLoading(false);
      navigate("/admin/classes");

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
      <h3 className="text-3xl font-semibold mb-6">Create Class</h3>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow space-y-4"
      >
        {error && <div className="p-5 bg-red-200 text-red-700 rounded-2xl my-3">{error}</div>}
        <div>
          <label className="block mb-1 font-medium">Section</label>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border rounded-lg p-2 w-full"
            placeholder="e.g. IT1, CSDS2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Academic Start Year</label>
          <input
            type="text"
            value={academicStartYear}
            onChange={(e) => setAcademicStartYear(e.target.value)}
            className="border rounded-lg p-2 w-full"
            placeholder="e.g. 2025"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Semester</label>
          <input
            type="text"
            min={1}
            max={8}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border rounded-lg p-2 w-full"
            placeholder="1 - 8"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Class"}
        </button>
      </form>
      </div>
    </div>
  );
}
