import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["MCQ", "text", "rating"], 
      required: true,
    },
    measure:{
        type:String,
        enum:["stress","mentalability"],
    },
    options: {
      type: [String], 
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile", 
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } 
);

export const Question = mongoose.model("Question", questionSchema);
