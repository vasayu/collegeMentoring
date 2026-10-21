import mongoose from "mongoose";

const feedbackQuestionSchema = new mongoose.Schema({
  heading: { type: String },
  questionText: { type: String, required: true },
  type: {
    type: String,
    enum: ["MCQ", "text"],
    default: "MCQ",
  },
  options: {
    type: [String],
    default: ["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"],
  },
});

const feedbackFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  reflections: [
    { 
      questionText: { type: String, required: true },
      type: { type: String, enum: ["text"], default: "text" } 
    } 
  ],
  questions: [feedbackQuestionSchema], 
  isActive: { type: Boolean, default: true }, 
}, { timestamps: true });

export const FeedbackForm = mongoose.model("FeedbackForm", feedbackFormSchema);
