// src/pages/AddCounselor.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiCLient, CREATE_COUNSELOR_ROUTE } from "@/service/app";
import toast from "react-hot-toast";

export default function AddCounselor() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const [counselor, setCounselor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeId: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCounselor({ ...counselor, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // match backend required fields (firstName, email, password, employeeId)
    if (!counselor.firstName || !counselor.email || !counselor.password || !counselor.employeeId) {
      setError("Please fill all required fields");
      return;
    }

    const payload = {
      firstName: counselor.firstName,
      lastName: counselor.lastName,
      email: counselor.email,
      password: counselor.password,
      employeeId: counselor.employeeId,
      phone: counselor.phone,
    };

    try {
      await apiCLient.post(CREATE_COUNSELOR_ROUTE, payload);
      toast.success("Counselor added successfully!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add counselor");
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
                    <h2 className="text-3xl font-bold tracking-tight">Add New Counselor</h2>
                    <p className="text-gray-500 mt-2 font-medium">Create a new counselor account to manage student wellness.</p>
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
                                    value={counselor.firstName}
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
                                    value={counselor.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@domain.com"
                                    value={counselor.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 (555) 000-0000"
                                    value={counselor.phone}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Employee ID <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    placeholder="e.g. EMP12345"
                                    value={counselor.employeeId}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Temporary Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={counselor.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="px-8 flex justify-center items-center py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent active:scale-[0.98] transition-all w-full md:w-auto"
                            >
                                Save Counselor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

