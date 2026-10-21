// src/pages/Signup.tsx
import React, { useState, useMemo } from "react";
import { apiCLient, CREATE_STUDENT_ROUTE } from "@/service/app";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Field = {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
    multiple?: boolean;
};

type Section = {
    section: string;
    fields?: Field[];
    groups?: { group: string; fields: Field[] }[];
};

const formSchema: Section[] = [
    {
        section: "Personal Profile",
        fields: [
            {
                name: "firstName",
                label: "First Name",
                type: "text",
                required: true,
            }, {
                name: "lastName",
                label: "Last Name",
                type: "text",
                required: true,
            },
            { name: "yearOfAdmission", label: "Year of Admission", type: "text", required: true },
            { name: "admission_no", label: "Admission No.", type: "text", required: true },
            {
                name: "program",
                label: "Program",
                type: "select",
                required: true,
                options: ["BTECH","MTECH","MSC","PHD"],
            },
            { name: "dob", label: "Date of Birth", type: "date" },
            {
                name: "permanent_address",
                label: "Permanent Address",
                type: "textarea",
            },
            { name: "height", label: "Height (cm)", type: "text" },
            { name: "weight", label: "Weight (kg)", type: "text" },
            {
                name: "blood_group",
                label: "Blood Group",
                type: "select",
                options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
            },
            {
                name: "phone",
                label: "Mobile Number of Student",
                type: "tel"
            },
            { name: "email", label: "E-mail ID of Student", type: "email", required: true },
            {
                name: "password",
                label: "Create Password",
                type: "password",
                required: true,
            },
            {
                name: "confirm_password",
                label: "Confirm Password",
                type: "password",
                required: true,
            },
            {
                name: "hostellite",
                label: "Hostellite / Day Scholar",
                type: "select",
                options: ["Hostellite", "Day Scholar"],
            },
        ],
    },
    {
        section: "Family Profile(Optional)",
        groups: [
            {
                group: "Father’s Details",
                fields: [
                    { name: "father_name", label: "Name", type: "text" },
                    { name: "father_occupation", label: "Occupation", type: "text" },
                    { name: "father_education", label: "Education", type: "text" },
                    { name: "father_mobile", label: "Mobile Number", type: "tel" },
                    { name: "father_email", label: "Email Id", type: "email" },
                ],
            },
            {
                group: "Mother’s / Guardian’s Details",
                fields: [
                    { name: "mother_name", label: "Name", type: "text" },
                    { name: "mother_occupation", label: "Occupation", type: "text" },
                    { name: "mother_education", label: "Education", type: "text" },
                    { name: "mother_mobile", label: "Mobile Number", type: "tel" },
                    { name: "mother_email", label: "Email Id", type: "email" },
                ],
            },
            {
                group: "Siblings Details",
                fields: [
                    {
                        name: "siblings_count",
                        label: "Number of Siblings",
                        type: "number",
                    },
                    {
                        name: "sisters",
                        label: "Sisters (Name)",
                        type: "text",
                        multiple: true,
                    },
                    {
                        name: "brothers",
                        label: "Brothers (Name)",
                        type: "text",
                        multiple: true,
                    },
                ],
            },
        ],
    },
];

const CreateStudent: React.FC = () => {
    //   const { user } = useAuth();
    const user = {

    }
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: "error" | "success";
        text: string;
    } | null>(null);
    // If user exists and role not admin/mentor -> show unauthorized

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const validate = () => {
        // check required fields in top-level personal fields
        const personal = formSchema[0].fields ?? [];
        for (const f of personal) {
            if (f.required) {
                const val = (formData as any)[f.name];
                if (!val || String(val).trim() === "") {
                    setMessage({ type: "error", text: `${f.label} is required` });
                    return false;
                }
            }
        }
        // password match
        if ((formData as any).password !== (formData as any).confirm_password) {
            setMessage({
                type: "error",
                text: "Password and confirm password do not match",
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        //change later 
        if (!true) {
            setMessage({
                type: "error",
                text: "You are not authorized to create students.",
            });
            return;
        }
        if (!validate()) return;

        setSubmitting(true);
        try {
            // Map form fields to backend expected payload
            // creatingStudentProfile expects:
            // { firstName, lastName, email, password, department, admissionNo, phone, dob, yearOfAdmission, program }
        
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                department: formData.department ?? formData.program ?? "", // flexible mapping
                admissionNo: formData.admission_no ?? "",
                phone: formData.phone ?? "",
                dob: formData.dob ?? "",
                yearOfAdmission: formData.year_of_admission ?? "",
                program: formData.program ?? "",
                extra: {
                    permanent_address: formData.permanent_address,
                    height: formData.height,
                    weight: formData.weight,
                    blood_group: formData.blood_group,
                    hostellite: formData.hostellite,
                    father_name: formData.father_name,
                    father_mobile: formData.father_mobile,
                    mother_name: formData.mother_name,
                    siblings_count: formData.siblings_count,
                },
            };
            console.log("payload",payload)
            const res = await apiCLient.post(CREATE_STUDENT_ROUTE, payload);
            const msg = res.data?.message ?? "Student created successfully";
            console.log("res",res);
            setMessage({ type: "success", text: msg });
            setFormData({});
            toast.success("Successfully created student");
            setTimeout(() => {
                navigate(-1);
            }, 800);
            
        } catch (err: any) {
            setMessage({
                type: "error",
                text: "Error in creating student: " + err.response.data.message,
            });
            toast.error("Error in creating student: " + err.response.data.message)
        } finally {
            setSubmitting(false);
        }
    };

    if (!true) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded shadow text-center">
                    <h3 className="text-lg font-semibold">Unauthorized</h3>
                    <p className="text-sm text-gray-600">
                        Only admin/mentor can create student profiles.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 relative">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white shadow-sm border border-gray-100 z-[60]"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
            </button>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[95rem] bg-white p-8 md:p-12 shadow-2xl shadow-blue-900/5 rounded-3xl border border-gray-100 space-y-12"
            >
                <div className="text-center space-y-3 border-b border-gray-100 pb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Create Student
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">
                        Please fill in the details below to complete the student profile
                    </p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-2xl flex items-center gap-3 font-medium ${
                            message.type === "error"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                        }`}
                    >
                        {message.type === "error" ? (
                             <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        ) : (
                             <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-14 items-start">
                    {formSchema.map((section, idx) => (
                        <div key={idx} className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {section.section}
                                </h2>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>

                            {/* Regular Fields */}
                            {section.fields && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {section.fields.map((field) => (
                                        <div key={field.name} className={`flex flex-col ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                                            <label htmlFor={field.name} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1.5 text-lg leading-none mt-1">*</span>}
                                            </label>

                                            {field.type === "textarea" ? (
                                                <textarea
                                                    id={field.name}
                                                    name={field.name}
                                                    required={field.required}
                                                    value={formData[field.name] ?? ""}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className="w-full border border-gray-300 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all resize-y"
                                                />
                                            ) : field.type === "select" ? (
                                                <select
                                                    id={field.name}
                                                    name={field.name}
                                                    required={field.required}
                                                    value={formData[field.name] ?? ""}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all appearance-none pr-10"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options?.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={formData[field.name] ?? ""}
                                                    type={field.type}
                                                    required={field.required}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Grouped Fields */}
                            {section.groups && (
                                <div className="space-y-6">
                                    {section.groups.map((group, gIdx) => (
                                        <div key={gIdx} className="bg-gray-50/70 p-6 md:p-8 rounded-2xl border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center before:w-1.5 before:h-5 before:bg-blue-600 before:mr-3 before:rounded-full">
                                                {group.group}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                {group.fields.map((field) => (
                                                    <div key={field.name} className="flex flex-col">
                                                        <label htmlFor={field.name} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                                            {field.label}
                                                            {field.required && <span className="text-red-500 ml-1.5 text-lg leading-none mt-1">*</span>}
                                                        </label>
                                                        <input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={formData[field.name] ?? ""}
                                                            type={field.type}
                                                            required={field.required}
                                                            onChange={handleChange}
                                                            className="w-full border border-gray-300 rounded-xl p-3.5 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-10 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                            submitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {submitting && (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {submitting ? "Creating Profile..." : "Create Student"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStudent;
