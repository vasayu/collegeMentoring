import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: { type: String, required: true, unique: true }, // e.g. HOD2025-001
    // department: {
    //   type: String,
    //   required: true,
    //   enum: ["IT", "CSE", "CSDS", "ECE", "EE", "EEE", "MECH", "CIVIL"],
    // },

    designation: { type: String, default: "Head of Department" },
    address: { type: String },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeacherProfile" }], // Teachers under HOD
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // Classes under HOD
  },
  { timestamps: true }
);

export const AdminProfile = mongoose.model("AdminProfile", adminProfileSchema);
