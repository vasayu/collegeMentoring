import { useEffect, useState } from "react";
import { apiCLient, GET_USER_ROUTE, LOGOUT_ROUTE } from "../../service/app";
import { LogOut, Users, Calendar, MessageSquare, Skull } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CounselorProfile {
    employeeId: string;
    specialization: string;
    qualifications: string;
    yearsOfExperience: number;
    address: string;
}

interface Counselor {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department?: string;
    role: number;
    counselorProfile?: CounselorProfile;
}

const CounselorDashboard = () => {
    const [counselor, setCounselor] = useState<Counselor | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCounselor = async () => {
            try {
                const res = await apiCLient.get(GET_USER_ROUTE); // '/me'
                const profile = res.data.data; // backend returns profile in data

                if (!profile?.counselorId) return;

                const transformed: Counselor = {
                    _id: profile.counselorId._id,
                    firstName: profile.counselorId.firstName,
                    lastName: profile.counselorId.lastName,
                    email: profile.counselorId.email,
                    phone: profile.counselorId.phone || "",
                    department: profile.counselorId.department || "",
                    role: profile.counselorId.role,
                    counselorProfile: {
                        employeeId: profile.employeeId,
                        specialization: Array.isArray(profile.specialization)
                            ? profile.specialization.join(", ")
                            : profile.specialization || "",
                        qualifications: Array.isArray(profile.qualifications)
                            ? profile.qualifications.join(", ")
                            : profile.qualifications || "",
                        yearsOfExperience: profile.yearsOfExperience || 0,
                        address: profile.address || "",
                    },
                };
                console.log(res);
                setCounselor(transformed);
            } catch (err) {
                console.error("Failed to load counselor details", err);
            }
        };

        fetchCounselor();
    }, []);

   

    if (!counselor) return <div className="p-6">Loading...</div>;

return (
  <div className="p-6 bg-gray-100 min-h-screen">
    {/* Header */}
    <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Counselor Dashboard</h1>
    </div>

    {/* Profile Card */}
    <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-6xl mx-auto border border-indigo-100 hover:shadow-lg transition-all">
      <h2 className="font-semibold text-2xl mb-4 text-indigo-600 border-b-2 border-indigo-100 pb-2">
        Counselor Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">Name:</span> {counselor.firstName} {counselor.lastName}
          </p>
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">Email:</span> {counselor.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">Phone:</span> {counselor.phone || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">Department:</span> {counselor.department || "N/A"}
          </p>
        </div>

        {counselor.counselorProfile && (
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Employee ID:</span> {counselor.counselorProfile.employeeId}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Specialization:</span> {counselor.counselorProfile.specialization}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Qualifications:</span> {counselor.counselorProfile.qualifications}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Experience:</span> {counselor.counselorProfile.yearsOfExperience} years
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Address:</span> {counselor.counselorProfile.address}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {/* Total Students Card */}
      <div onClick={() => navigate("/counselor/classes")} className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4 h-32 hover:scale-101 hover:shadow-md transition transform cursor-pointer">
        <Users className="w-10 h-10 text-indigo-500" />
        <div>
          <p className="text-gray-500 text-xl">Classes</p>
          <p className="font-bold text-2xl text-gray-800"></p>
        </div>
      </div>

      {/* Mental Ability Form Card */}
      <div onClick={() => navigate('/add-mental-ability')} className="bg-white p-6 rounded-2xl shadow flex items-center justify-between h-32 hover:scale-101 hover:shadow-md transition transform cursor-pointer">
        <div>
          <p className="text-gray-500 text-xl">Mental Ability Form</p>
        </div>
        <Calendar className="w-12 h-12 text-green-500" />
      </div>
      <div onClick={() => navigate("/counselor/alert-students")} className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4 h-32 hover:scale-101 hover:shadow-md transition transform cursor-pointer">
        <Skull className="w-10 h-10 text-red-500" />
        <div>
          <p className="text-gray-500 text-xl">Alerted Students</p>
          <p className="font-bold text-2xl text-gray-800"></p>
        </div>
      </div>
    </div>
  </div>
);

};

export default CounselorDashboard;




