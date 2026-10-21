import mongoose from "mongoose";

const counselorProfileSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: { type: String, required: true, unique: true },
    specialization: [String],//[mental health,career guidence]

    qualifications: [String], //["PHD",MBBs]
    yearsOfExperience: { type: Number, default: 0 },

    address: { type: String },

    classesHandled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  { timestamps: true }
);

export const CounselorProfile = mongoose.model(
  "CounselorProfile",
  counselorProfileSchema
);
