import express from "express";
import mongoose from "mongoose";

import { Response } from "../models/models.index.js";
import { StudentProfile } from "../models/models.index.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Submit survey response (student only)
router.post(
  "/student/responses",
  verifyJWT,
  authorizeRoles(0), // sirf students
  asyncHandler(async (req, res) => {
    const { stressIndex, mentalAbility } = req.body;

    const newResponse = new Response({
      studentId: req.user._id, // JWT se automatically
      stressIndex,
      mentalAbility,
    });
    const sId = req.user._id;
    await newResponse.save();
    
    // Convert stressIndex to Number to ensure comparison works correctly
    const isStressed = Number(stressIndex) >= 4.0;
    
    const res1 = await StudentProfile.findOneAndUpdate(
      { studentId: sId },
      { stressAlert: isStressed },
      { new: true }
    );
    
    console.log(`Survey Submitted: Student ${sId}, Stress Index: ${stressIndex}, Alert Set: ${isStressed}, Profile Updated: ${!!res1}`);
    res.status(201).json({ message: "Survey response saved!" });
  })
);

// Get all responses (for admin/counselor)
router.get(
  "/student/responses",
  verifyJWT,
  authorizeRoles(1, 2, 3, 4),
  asyncHandler(async (req, res) => {
    const students = await Response.find().populate(
      "studentId",
      "firstName lastName email"
    );
    res.json(students);
  })
);
// Get response by studentId
router.get(
  "/student/:studentId",
  verifyJWT,
  authorizeRoles(1, 2, 3, 4),
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const response = await Response.findOne({ studentId })
      .populate({
        path: "studentId", // populate the User
        select: "admissionNo semester hostellite program yearOfAdmission",
      })
      .populate({
        path: "studentId", // populate the StudentProfile via virtual
        select: "firstName lastName email role department",
      });

    if (!response) return res.status(404).json({ error: "Student not found" });
    res.json(response);
  })
);

// Chart data by studentId

// router.get(
// 	"/student/:studentId/chart",
// 	verifyJWT,
// 	authorizeRoles(1, 2, 3),
// 	asyncHandler(async (req, res) => {
// 		console.log("Chart API hit for studentId:", req.params.studentId);

// 		const { studentId } = req.params;

// 		if (!mongoose.Types.ObjectId.isValid(studentId)) {
// 			console.log("Invalid ObjectId:", studentId);
// 			return res.status(400).json({ error: "Invalid student ID" });
// 		}

// 		const response = await Response.findOne({
// 			"studentInfo.studentId": mongoose.Types.ObjectId(studentId),
// 		});

// 		console.log("DB response:", response);

// 		if (!response) {
// 			console.log("Student response not found in DB");
// 			return res.status(404).json({ error: "Student not found" });
// 		}

// 		const optionToScore = {
// 			"Strongly Disagree": 1,
// 			Disagree: 2,
// 			Neutral: 3,
// 			Agree: 4,
// 			"Strongly Agree": 5,
// 		};

// 		const chartData = Object.entries(response.answers || {}).map(
// 			([qId, ans]) => ({
// 				question: qId,
// 				value: optionToScore[ans] || 0,
// 			})
// 		);

// 		console.log("Chart data:", chartData);

// 		res.json(chartData);
// 	})
// );

export default router;
