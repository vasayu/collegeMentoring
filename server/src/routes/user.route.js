// routes/user.routes.js
import express from "express";
import {
	creatingStudentProfile,
	createStudentsByUpload,
	login,
	updateStudentProfile,
	logoutUser,
	changeCurrentPassword,
	updateCurrentUser,
	getCurrentUser,
	getUserById,
	getStudentByAdmissionNo,
	creatingCounselorProfile,
	getGrade,
	removeStudentFromCollege,
} from "../controllers/user.controller.js"; // Adjust name if different

import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
// controllers/student.controller.js
import { Question } from "../models/models.index.js";

const router = express.Router();

// Student can fetch all questions
export const getQuestionsForStudent = async (req, res) => {
	try {
		const questions = await Question.find(
			{},
			"-createdBy -createdAt -updatedAt",
		); // sensitive fields hide
		res.status(200).json({ success: true, data: questions });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
// Student fetch all questions
router.get("/questions", verifyJWT, authorizeRoles(0), getQuestionsForStudent);

// Student signup
router.post(
	"/create-student-profile",
	verifyJWT,
	authorizeRoles(1, 2,4),
	creatingStudentProfile,
);
router.post(
	"/create-counselor-profile",
	verifyJWT,
	authorizeRoles(2,4),
	creatingCounselorProfile,
);

router.post(
	"/create-students-by-upload",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	upload.single("file"),
	createStudentsByUpload,
);

// Login
router.post("/login", login);

// Logout
router.post("/logout", verifyJWT, logoutUser);

// Change password
router.post("/change-password", verifyJWT, changeCurrentPassword);

// Get current user
router.get("/me", verifyJWT, getCurrentUser);

// Update own profile (any authenticated user)
router.patch("/update-me", verifyJWT, updateCurrentUser);

// Get user by ID
router.get("/find-user/:userId", verifyJWT, authorizeRoles(1, 2, 4), getUserById);

// Update student profile
router.patch(
	"/student/:studentId",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	updateStudentProfile,
);
router.post(
	"/remove-student",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	removeStudentFromCollege,
);
router.post(
	"/get-student-by-admission-no",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getStudentByAdmissionNo,
);
router.post("/get-grade", verifyJWT, authorizeRoles(0, 1, 2, 4), getGrade);

export default router;
