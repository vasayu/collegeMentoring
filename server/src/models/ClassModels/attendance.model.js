import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    semester: { type: Number, min: 1, max: 8, required: true },

    subjectCode: { type: String, required: true },
    subjectName: { type: String },

    attendees: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        present: { type: Boolean, default: false },
      },
    ],
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // mentor/teacher
  },
  { timestamps: true }
);

// prevent duplicate session for same date/class/subject
attendanceSessionSchema.index(
  { date: 1, classId: 1, subjectCode: 1 },
  { unique: true }
);

export const AttendanceSession = mongoose.model(
  "AttendanceSession",
  attendanceSessionSchema
);
