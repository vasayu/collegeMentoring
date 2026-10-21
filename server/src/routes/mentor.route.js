import express from "express";
import {
	addMentor,
	updateMentorProfile,
	getMentorProfile,
	getStudentProfile,
	updateGrade,
	// updateAttendance,
	getMentorClassDetails,
	getAllasignStudent,
	createGradeForStudent,
	removeClass,
	updateStudent,
	removeStudentFromClass,
	deleteStudent,
	deleteAllStudentsFromClass,
	getAlertStudentsOfClass,
	getClassGrades,
	batchUpdateGrades,
	getClassStressDistribution,
} from "../controllers/mentors.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
	addSubjectsToSection,
	assignStudentToClass,
} from "../controllers/mentors.controller.js";
import { get } from "mongoose";

const router = express.Router();

// Create a new mentor (Only accessible to Admin/HOD)
router.post("/add-mentor", verifyJWT, authorizeRoles(2, 4), addMentor);

// Update mentor profile
router.patch("/update", verifyJWT, authorizeRoles(1, 2, 4), updateMentorProfile);

// Get mentor profile
router.get(
	"/view/:mentorId",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getMentorProfile
);

// Assign student to class (Only Admin or Mentor can do this)
router.post(
	"/assign-classToStudent",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	assignStudentToClass
);
router.post(
	"/assign-subjectToClass",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	addSubjectsToSection
);

// Get student profile
router.get(
	"/student/:studentId",
	verifyJWT,
	authorizeRoles(1, 2, 3, 4),
	getStudentProfile
);
// Get student profile
// router.get(
//   "/mentor/:teacherId",
//   verifyJWT,
//   authorizeRoles(1, 2),
//   getMentorProfile
// );
// router.get(
//   "/mentor-profile",
//   verifyJWT,
//   authorizeRoles(1, 2),
//   getMentorProfile
// );
router.post("/update-grade", verifyJWT, authorizeRoles(1, 2, 4), updateGrade);
// router.post(
//   "/update-attendance",
//   verifyJWT,
//   authorizeRoles(1, 2),
//   updateAttendance
// );

router.post(
	"/create-grade",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	createGradeForStudent
);

router.get(
	"/get-my-classes",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getMentorClassDetails
);
router.get(
	"/get-class-students",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getAllasignStudent
);
router.post("/remove-class", verifyJWT, authorizeRoles(1, 2, 4), removeClass);

router.post(
	"/update-student",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	updateStudent
);

router.post(
	"/remove-student-from-class",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	removeStudentFromClass
);
router.post(
	"/delete-student",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	deleteStudent
);

router.post(
	"/delete-all-students-from-class",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	deleteAllStudentsFromClass
);

router.get(
	"/alert-students-of-class/:classId",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getAlertStudentsOfClass
);

router.get(
	"/class-grades/:classId",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getClassGrades
);

router.post(
	"/batch-update-grades",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	batchUpdateGrades
);

router.get(
	"/stress-distribution/:classId",
	verifyJWT,
	authorizeRoles(1, 2, 4),
	getClassStressDistribution
);

export default router;
