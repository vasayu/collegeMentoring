import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: true,
            trim: true,
        },

        subjectCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },

        credits: {
            type: Number,
            default: 3,
        },

        type: {
            type: String,
            enum: ["THEORY", "LAB", "ELECTIVE"],
            default: "THEORY",
        },

        assignedTeachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TeacherProfile", // or "Teacher" if you have a separate model
            },
        ],
    },
    { timestamps: true }
);

export const Subject = mongoose.model("Subject", subjectSchema);
