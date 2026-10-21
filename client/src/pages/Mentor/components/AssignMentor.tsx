import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { apiCLient, GET_ALL_MENTORS ,ASSIGN_MENTOR_ROUTE} from "@/service/app"
import toast from "react-hot-toast"

interface Mentor {
  _id: string
  employeeId:string
  teacherId: {
    firstName: string
    lastName?: string
    email: string
  }
  designation?: string
  specialization?: string[]
}

interface MentorSearchProps {
  onClose: () => void
  classId: string
  onSuccess: (newMentor:any) => void
}

export default function MentorSearchOverlay({onClose,classId,onSuccess}: MentorSearchProps) {
    const [query, setQuery] = useState("");
    const [mentors, setMentors ] = useState<Mentor[]>([]);

    useEffect(() => {
        const fetchMentors = async() => {
            const res = await apiCLient.get(GET_ALL_MENTORS);
            setMentors(res.data.data);
        }
        fetchMentors();
    },[])

    const handleSelect = async(mentorId:any,classId:any) => {
        try{
            const res = await apiCLient.post(ASSIGN_MENTOR_ROUTE,{
                mentorId,
                classId
            })
            toast.success("Mentor assigned successfully");
            console.log(res.data.data);
            onSuccess(res.data.data.mentorId);
        }catch(err){
            console.log(err);
        }finally{
            onClose();
        }
    }
    const filtered = mentors.filter((m) =>
        `${m.teacherId.firstName} ${m.teacherId.lastName || ""} ${m.employeeId} ${m.teacherId.email}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 m-0">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
            <input
                type="text"
                placeholder="Search mentors..."
                className="w-full outline-none px-3 py-2 text-lg rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => {
                    console.log(filtered)
                    setQuery(e.target.value)
                }}
            />
            <button
                onClick={onClose}
                className="ml-3 text-gray-500 hover:text-black cursor-pointer"
            >
                <X size={22} />
            </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
            {filtered.length > 0 ? (
                <ul className="divide-y">
                {filtered.map((m) => (
                    <li
                    key={m._id}
                    className="p-4 hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => handleSelect(m._id,classId)}
                    >
                    <p className="font-medium">
                        {m.teacherId.firstName} {m.teacherId.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{m.employeeId} - {m.teacherId.email}</p>
                    {m.designation && (
                        <p className="text-xs text-gray-400">{m.designation}</p>
                    )}
                    </li>
                ))}
                </ul>
            ) : (
                <p className="p-4 text-center text-gray-500">No mentors found</p>
            )}
            </div>
        </div>
        </div>
    )
}
