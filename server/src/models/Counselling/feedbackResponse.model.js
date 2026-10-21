import mongoose from "mongoose";

const feedbackResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "FeedbackForm", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherProfile", },
  subjectCode: { type: String }, // NEW: Track feedback per subject
  subjectName: { type: String }, // NEW: Subject name for display
  reflections: [{ type: String }], 
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: { type: String, required: true },
    }
  ],
}, { timestamps: true });

// Prevent same student submitting same form twice for the same subject
feedbackResponseSchema.index({ formId: 1, studentId: 1, subjectCode: 1 }, { unique: true });

export const FeedbackResponse = mongoose.model("FeedbackResponse", feedbackResponseSchema);
