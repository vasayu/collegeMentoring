import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import QuestionForm from "../Admin/components/QuestionForm";
import QuestionList from "../Admin/components/QuestionList";

const AddMentalAbility = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editQuestion, setEditQuestion] = useState<any>(null);

  // Triggered after Add / Update
  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditQuestion(null); // reset editing state
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
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <div className="mb-8 text-center text-gray-900">
            <h1 className="text-3xl font-bold tracking-tight">Question Settings</h1>
            <p className="text-gray-500 mt-2 font-medium">Configure questions for evaluating student mental ability and stress.</p>
        </div>

      {/* Form for Add / Edit */}
      <QuestionForm 
        question={editQuestion} 
        onSuccess={handleSuccess} 
      />

      <div className="mt-6">
        {/* List of questions */}
        <QuestionList 
          refreshKey={refreshKey} 
          onEdit={(q) => setEditQuestion(q)} 
        />
      </div>
    </div>
    </div>
  );
};

export default AddMentalAbility;
