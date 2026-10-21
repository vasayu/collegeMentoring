import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: { type: String, required: true, unique: true }, // e.g. TCH2025-101
    designation: { type: String }, // Assistant Prof, Associate Prof, etc.
    specialization: [String], // ["AI", "ML", "Networks"]
    subjectsAssigned: [String], // ["Data Structures", "Algorithms"]
    // department: {
    //   type: String,
    //   required: true,
    //   enum: ["IT", "CSE", "ECE", "EE", "EEE", "MECH", "CIVIL"],
    // },

    qualifications: [String], // ["PhD", "MTech"]
    yearsOfExperience: { type: Number, default: 0 },

    address: { type: String },

    classesHandled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  { timestamps: true }
);

export const TeacherProfile = mongoose.model(
  "TeacherProfile",
  teacherProfileSchema
);
