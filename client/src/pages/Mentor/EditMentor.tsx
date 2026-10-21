import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { apiCLient, GET_MENTOR_ID_ROUTE, UPDATE_MENTOR_ROUTE } from "@/service/app";
import toast from "react-hot-toast";

export default function EditMentor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState<String>("");
    const [mentor, setMentor] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        employeeId: "",
        specialization: "",
        qualifications: "",
        yearsOfExperience: "",
        address: ""
    });


    useEffect(() => {
        const fetchMentor = async () => {
            try {
                const res = await apiCLient.get(`${GET_MENTOR_ID_ROUTE}/${id}`);
                console.log(res);
                const data = res.data.data;
                setMentor({
                    firstName: data.teacherId.firstName,
                    lastName: data.teacherId.lastName || "",
                    email: data.teacherId.email,
                    password: "",
                    employeeId: data.employeeId || "",
                    specialization: data.specialization || [],
                    qualifications: data.qualifications || [],
                    yearsOfExperience: data.yearsOfExperience || 0,
                    address: data.address || ""
                });
            } catch (err) {
                console.log(err);
            }
        }
        fetchMentor();
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMentor({ ...mentor, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mentor.email || !mentor.employeeId || !mentor.firstName || !mentor.lastName) {
            setError("Fill all the fields");
            return;
        }

        if (mentor.password.length > 0 && mentor.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            const res = await apiCLient.patch(UPDATE_MENTOR_ROUTE, {
                id: id,
                updates: mentor
            });
            toast.success("Updated successfully");
            navigate("/admin");
        } catch (err: any) {
            toast.error("Failed to update");
            setError(err.response.data.message);
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
            <div className="max-w-3xl mx-auto px-4 lg:px-6">
                <div className="mb-8 text-center text-gray-900">
                    <h2 className="text-3xl font-bold tracking-tight">Update Mentor Profile</h2>
                    <p className="text-gray-500 mt-2 font-medium">Edit personal details and professional qualifications.</p>
                </div>
                
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium mb-6">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Enter first name"
                                    value={mentor.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Enter last name"
                                    value={mentor.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@domain.com"
                                value={mentor.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Employee ID <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    placeholder="e.g. EMP12345"
                                    value={mentor.employeeId}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">New Password <span className="text-gray-400 font-normal italic">(Leave blank to keep current)</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={mentor.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="yearsOfExperience"
                                        placeholder="e.g. 5"
                                        value={mentor.yearsOfExperience}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Address / Location</label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Room No, Building, City"
                                        value={mentor.address}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Specialization</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        placeholder="Enter core areas, separated by commas (e.g. Software Eng, AI)"
                                        value={mentor.specialization}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Qualifications</label>
                                    <input
                                        type="text"
                                        name="qualifications"
                                        placeholder="Enter degrees, separated by commas (e.g. PhD, M.Tech)"
                                        value={mentor.qualifications}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="px-8 flex justify-center items-center py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent active:scale-[0.98] transition-all w-full md:w-auto"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
