import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    admissionNo: { type: String, required: true, unique: true, trim: true }, // e.g. 23CSEDS11
    yearOfAdmission: { type: Number }, // 2023
    stressAlert: {
        type:Boolean,
        default:false
    },
    program: {
      type: String,
      enum: ["BTECH", "MTECH", "MSC", "PHD"],
      default: "BTECH",
    },
    semester: { type: Number, min: 1, max: 8 }, // current semester snapshot
    hostellite: {
      type: String,
      enum: ["dayScholar", "BoysHostle",],
    },

    permanentAddress: { type: String },
    currentAddress: { type: String },

    bloodGroup: { type: String },
    height: { type: Number }, 
    weight: { type: Number },
    localGuardian: {
      name: String,
      relation: String,
      phone: String,
      address: String,
    },

    father: {
      name: { type: String },
      occupation: { type: String },
      education: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    mother: {
      name: { type: String },
      occupation: { type: String },
      education: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    siblings: [{ name: String, relation: String }],

    careerGoals: { type: String },
    strengths: [String],
    achievements: [String],
    hobbies: [String],
    subjectsOfInterest: [String],
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);
