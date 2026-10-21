import React, { useEffect, useState } from "react";
import { apiCLient } from "@/service/app";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Teacher {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
}

const AddSubject = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const [form, setForm] = useState({
        subjectName: "",
        subjectCode: "",
        semester: "",
        credits: 3,
        type: "THEORY",
        assignedTeachers: [] as string[],
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await apiCLient.get("/admin/teachers");
                setTeachers(res.data.data);
            } catch (err) {
                toast.error("Failed to load teachers");
            }
        };
        fetchTeachers();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleTeacherSelect = (id: string) => {
        setForm((prev) => ({
            ...prev,
            assignedTeachers: prev.assignedTeachers.includes(id)
                ? prev.assignedTeachers.filter((t) => t !== id)
                : [...prev.assignedTeachers, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.subjectName || !form.subjectCode || !form.semester) {
            toast.error("Subject name, code and semester are required");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                subjectName: form.subjectName.trim(),
                subjectCode: form.subjectCode.trim().toUpperCase(),
                semester: Number(form.semester),
                credits: Number(form.credits),
                type: form.type,
                assignedTeachers: form.assignedTeachers,
            };

            await apiCLient.post("/admin/subjects", payload);

            toast.success("Subject created successfully");
            navigate(-1);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create subject");
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
            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-3xl font-semibold mb-6">Add Subject</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject Name */}
                <input
                    name="subjectName"
                    placeholder="Subject Name"
                    value={form.subjectName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg"
                />

                {/* Subject Code */}
                <input
                    name="subjectCode"
                    placeholder="Subject Code (e.g. CS301)"
                    value={form.subjectCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg uppercase"
                />

                {/* Semester + Credits */}
                <div className="grid grid-cols-2 gap-4">
                    <select
                        name="semester"
                        value={form.semester}
                        onChange={handleChange}
                        className="px-4 py-3 border rounded-lg"
                    >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>
                                Semester {s}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="credits"
                        value={form.credits}
                        min={1}
                        max={6}
                        onChange={handleChange}
                        className="px-4 py-3 border rounded-lg"
                    />
                </div>

                {/* Subject Type */}
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg"
                >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Lab</option>
                    <option value="ELECTIVE">Elective</option>
                </select>

                {/* Assigned Teachers */}
                <div>
                    <p className="font-medium mb-2">Assign Teachers</p>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                        {teachers.map((t) => (
                            <label
                                key={t._id}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={form.assignedTeachers.includes(t._id)}
                                    onChange={() => handleTeacherSelect(t._id)}
                                />
                                <span>
                                    {t.firstName} {t.lastName} ({t.email})
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-300 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Subject"}
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
};

export default AddSubject;
