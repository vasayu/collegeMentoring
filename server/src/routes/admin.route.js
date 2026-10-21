// routes/admin.routes.js
import express from "express";
import {
	createAdminProfile,
	getAdminProfile,
	updateAdminProfile,
	assignMentorToClass,
	createClass,
	getClassById,
	updateClassDeatils,
	getAllClassesOfDepartment,
	getAllStudentsOfDepartment,
	getAllMentorOfDepartment,
	createQuestion,
	getAllQuestions,
	getQuestionById,
	updateQuestion,
	deleteQuestion,
	getAllCounselors,
	//   alertStudents
    addSubject,
    getSubjects,
	getAlertStudentsByFilter,
	deleteMentor,
	deleteCounselor,
	getAllAdmins,
	getAdminById,
	updateAdminById,
	deleteAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only HOD (role: 2) can create admin profile
router.post(
	"/create-new-admin",
	verifyJWT,
	authorizeRoles(2, 4),
	createAdminProfile
);

// Get specific admin profile by ID
router.get("/profileview", verifyJWT, authorizeRoles(2, 4), getAdminProfile);

// Update admin profile by ID
router.put(
	"/update-profile/:id",
	verifyJWT,
	authorizeRoles(2, 4),
	updateAdminProfile
);

// Assign mentor to class (also only allowed for HODs)
router.post(
	"/assign-mentors",
	verifyJWT,
	authorizeRoles(2, 4),
	assignMentorToClass
);

router.post("/create-class", verifyJWT, authorizeRoles(2, 4), createClass);
router.get("/class/:id", verifyJWT, authorizeRoles(2, 3, 4), getClassById);
router.patch(
	"/class/update/:id",
	verifyJWT,
	authorizeRoles(2, 4),
	updateClassDeatils
);

router.get(
	"/get-all-mentors",
	verifyJWT,
	authorizeRoles(2,4),
	getAllMentorOfDepartment
);
router.get(
	"/get-all-classes",
	verifyJWT,
	authorizeRoles(2, 3,4),
	getAllClassesOfDepartment
);
router.get(
	"/get-all-students",
	verifyJWT,
	authorizeRoles(2,4),
	getAllStudentsOfDepartment
);
router.get(
	"/get-all-counselors", //get all counselors
	verifyJWT,
	authorizeRoles(2,4),
	getAllCounselors
);

router.post("/questions", verifyJWT, authorizeRoles(2, 3,4), createQuestion); // Create question
router.get("/questions", verifyJWT, authorizeRoles(2, 3,4), getAllQuestions); // Get all questions
router.get("/questions/:id", verifyJWT, authorizeRoles(2, 3,4), getQuestionById); // Get question by ID
router.put("/questions/:id", verifyJWT, authorizeRoles(2, 3,4), updateQuestion); // Update question
router.delete(
	"/questions/:id",
	verifyJWT,
	authorizeRoles(2, 3,4),
	deleteQuestion
);
// router.get("/alert-students", verifyJWT, authorizeRoles(2,3), alertStudents); // Get all questions
router.post(
	"/alert-students",
	verifyJWT,
	authorizeRoles(2, 3,4),
	getAlertStudentsByFilter
); // Get alert students by filter

router.post("/subjects", verifyJWT, authorizeRoles(2,4), addSubject); // Add new subject
router.get("/subjects", verifyJWT, authorizeRoles(2, 3,4), getSubjects); // Get all subjects

router.post("/delete-mentor", verifyJWT, authorizeRoles(2,4), deleteMentor); // Delete mentor
router.post("/delete-counselor", verifyJWT, authorizeRoles(2,4), deleteCounselor); // Delete counselor

// --- MASTER ADMIN ONLY ROUTES ---
router.get("/get-all-admins", verifyJWT, authorizeRoles(4), getAllAdmins);
router.get("/get-admin/:id", verifyJWT, authorizeRoles(4), getAdminById);
router.patch("/update-admin/:id", verifyJWT, authorizeRoles(4), updateAdminById);
router.post("/delete-admin", verifyJWT, authorizeRoles(4), deleteAdmin);

export default router;
