import { apiCLient, ASSIGN_SUBJECT_TO_CLASS_ROUTE } from "@/service/app";
import React, { useEffect, useState } from "react";

interface Subject {
  subjectCode: string;
  subjectName: string;
  credits: number;
  teacher: string;
}

interface AddSubjectsProps {
  sectionId: string;
  initialSubjects?: Subject[];
  onSuccess?: (subjects: Subject[]) => void;
}

const AddSubjects: React.FC<AddSubjectsProps> = ({
  sectionId,
  initialSubjects = [],
  onSuccess,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubjects.length > 0) {
      setSubjects(initialSubjects);
    } else {
      setSubjects([
        { subjectCode: "", subjectName: "", credits: 0, teacher: "" },
      ]);
    }
  }, [initialSubjects]);

  const handleChange = (
    index: number,
    field: keyof Subject,
    value: string | number
  ) => {
    const updated = [...subjects];
    updated[index][field] = value as never;
    setSubjects(updated);
  };

  const addRow = () => {
    setSubjects((prev) => [
      ...prev,
      { subjectCode: "", subjectName: "", credits: 0, teacher: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!sectionId) {
      setError("Section ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiCLient.post(ASSIGN_SUBJECT_TO_CLASS_ROUTE, {
        sectionId,
        subjects,
      });
      console.log("subjects",subjects);
      if (onSuccess) onSuccess(subjects);

      if (res.data?.subjects) {
        setSubjects(res.data.subjects);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add subjects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all w-full">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Manage Subjects</h2>
        <button
          onClick={addRow}
          type="button"
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-sm transition-colors border border-blue-100/50"
        >
          + Add Row
        </button>
      </div>

      {/* Header row - explain fields */}
      <div className="hidden md:grid grid-cols-12 gap-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
        <span className="col-span-2">Code</span>
        <span className="col-span-4">Name</span>
        <span className="col-span-2">Credits</span>
        <span className="col-span-3">Teacher</span>
        <span className="col-span-1 text-center">Action</span>
      </div>

      <div className="space-y-3">
      {subjects.map((subj, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50/50 p-4 border border-gray-100 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-200 group"
        >
          <input
            type="text"
            placeholder="Subject Code"
            value={subj.subjectCode}
            onChange={(e) => handleChange(index, "subjectCode", e.target.value)}
            className="col-span-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
          />

          <input
            type="text"
            placeholder="Subject Name"
            value={subj.subjectName}
            onChange={(e) => handleChange(index, "subjectName", e.target.value)}
            className="col-span-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
          />

          <input
            type="number"
            placeholder="Credits"
            value={subj.credits}
            onChange={(e) =>
              handleChange(index, "credits", Number(e.target.value))
            }
            className="col-span-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
          />

          <input
            type="text"
            placeholder="Teacher Name"
            value={subj.teacher}
            onChange={(e) => handleChange(index, "teacher", e.target.value)}
            className="col-span-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
          />

          <div className="col-span-1 flex justify-center mt-2 md:mt-0">
            <button
              onClick={() => removeRow(index)}
              className="text-gray-400 hover:text-red-600 bg-white md:bg-transparent border md:border-transparent border-gray-200 rounded-lg md:rounded-full p-2 w-full md:w-auto transition-colors disabled:opacity-30 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
              disabled={subjects.length === 1}
              type="button"
              title="Remove row"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      ))}
      </div>

      <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={loading}
          type="button"
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
             <>
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Saving...
             </>
          ) : "Save Subjects"}
        </button>
      </div>

      {error && <p className="text-red-500 font-medium text-sm mt-4 text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
    </div>
  );
};

export default AddSubjects;
