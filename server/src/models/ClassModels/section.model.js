import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, trim: true }, // e.g., "IT1", "CSDS2"
    academicStartYear: { type: Number, required: true }, // e.g., 2025 (the session starting year)
    department: {
      type: String,
      required: true,
      enum: ["IT", "CSE", "ECE", "EE", "EEE", "MECH", "CIVIL"],
    },
    semester: { type: Number, min: 1, max: 8, required: true },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherProfile",
    }, // teacher for this class

    // optional: subjects taught in this class for this semester
    subjects: [
      {
        subjectCode: { type: String, required: true },
        subjectName: { type: String, required: true },
        credits: { type: Number, default: 0 },
        teacher: {
        //   type: mongoose.Schema.Types.ObjectId,
        type:String,
        //   ref: "TeacherProfile",
        },
      },
    ],

    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile" }], // role=0 students
  },
  { timestamps: true }
);

export const Section = mongoose.model("Section", classSchema);
