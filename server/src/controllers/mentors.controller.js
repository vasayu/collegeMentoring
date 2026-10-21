import mongoose from "mongoose";
import {
	User,
	Grade,
	TeacherProfile,
	StudentProfile,
	AttendanceSession,
	Section,
	Response,
} from "../models/models.index.js";


import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";

//mentor related function

// Add mentor
const addMentor = asyncHandler(async (req, res) => {
	let { firstName, lastName, email, password, employeeId } = req.body;
	email = email?.toLowerCase();
	if (!firstName || !email || !password || !employeeId) {
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new ApiError(400, "User with this email already exists");
	}

	const existingMentor = await TeacherProfile.findOne({ employeeId });
	if (existingMentor) {
		throw new ApiError(400, "Mentor with this employee ID already exists");
	}

	if (!req.user?.department) {
		throw new ApiError(400, "Department not found");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	let mentorProfile;

	try {
		//  Attach session
		const user = await User.create(
			[
				{
					role: 1, // Mentor
					firstName,
					lastName,
					email,
					password,
					department: req.user?.department,
				},
			],
			{ session },
		);

		mentorProfile = await TeacherProfile.create(
			[
				{
					teacherId: user[0]._id,
					employeeId,
				},
			],
			{ session },
		);

		//  Save both
		await session.commitTransaction();
		session.endSession();
	} catch (error) {
		//  Undo everything
		await session.abortTransaction();
		session.endSession();
		throw error;
	}

	const createdMentorProfile = await TeacherProfile.findOne({
		teacherId: mentorProfile[0].teacherId,
	}).populate(
		"teacherId",
		"firstName lastName email phone gender role department",
	);

	return res
		.status(201)
		.json(new ApiResponse(201, { createdMentorProfile }, "Mentor created"));
});

//update Mentor Profile
const updateMentorProfile = asyncHandler(async (req, res) => {
	const { id, updates } = req.body;

	// Support both admin-managed updates (with id) and self-updates (no id, use logged-in user)
	let profile;
	if (id) {
		profile = await TeacherProfile.findById(id).populate("teacherId");
	} else {
		profile = await TeacherProfile.findOne({ teacherId: req.user._id }).populate("teacherId");
	}
	if (!profile) {
		throw new ApiError(404, "Mentor profile not found");
	}

	// Split updates: teacherId fields vs profile fields
	const teacherUpdates = {};
	const profileUpdates = {};

	if (updates?.firstName) teacherUpdates.firstName = updates.firstName;
	if (updates?.lastName)  teacherUpdates.lastName  = updates.lastName;
	if (updates?.email)     teacherUpdates.email      = updates.email;

	if (updates?.employeeId)        profileUpdates.employeeId        = updates.employeeId;
	if (updates?.specialization)    profileUpdates.specialization    = updates.specialization;
	if (updates?.qualifications)    profileUpdates.qualifications    = updates.qualifications;
	if (updates?.yearsOfExperience !== undefined)
		profileUpdates.yearsOfExperience = updates.yearsOfExperience;
	if (updates?.address)      profileUpdates.address      = updates.address;
	if (updates?.designation)  profileUpdates.designation  = updates.designation;

	// Update User (teacherId reference)
	if (Object.keys(teacherUpdates).length > 0) {
		await User.findByIdAndUpdate(profile.teacherId._id, teacherUpdates, { new: true });
	}

	// Update TeacherProfile
	let updatedProfile = profile;
	if (Object.keys(profileUpdates).length > 0) {
		updatedProfile = await TeacherProfile.findByIdAndUpdate(
			profile._id,
			profileUpdates,
			{ new: true },
		).populate("teacherId", "firstName lastName email department role");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, updatedProfile, "Profile updated"));
});

// get mentor Profile
const getMentorProfile = asyncHandler(async (req, res) => {
	const { mentorId } = req.params;
	if (!mentorId) {
		throw new ApiError(403, "mentor id is required");
	}
	const mentor = await TeacherProfile.findById(mentorId)
		.select("-password -refreshToken")
		.populate({
			path: "teacherId",
			select: "firstName lastName email phone dob department role",
		});
	if (!mentor) throw new ApiError(404, "Mentor not found");
	return res
		.status(200)
		.json(new ApiResponse(200, mentor, "Mentor profile fetched"));
});

// give assigned class to login mentor
const getMentorClassDetails = asyncHandler(async (req, res) => {
	// const mentorId = req.user._id;

	const teacher = await TeacherProfile.findOne({ teacherId: req.user._id });
	const mentorId = teacher._id;

	const classes = await Section.find({ mentorId: mentorId }).populate({
		path: "mentorId",
		populate: {
			path: "teacherId", // populate 'studentId' which references the User model
			select: "firstName lastName email department role", // select the fields you want from User model
		},
	});
	if (!classes) throw new ApiError(404, "Classes not found");
	console.log("mentor class", classes);
	return res
		.status(200)
		.json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

// Section related function

// ading subject to class '
const addSubjectsToSection = asyncHandler(async (req, res) => {
	const { sectionId, subjects } = req.body;

	if (!sectionId || !Array.isArray(subjects) || subjects.length === 0) {
		throw new ApiError(400, "Section ID and subject list are required");
	}

	const section = await Section.findById(sectionId).populate("students");

	if (!section) {
		throw new ApiError(404, "Section not found");
	}

	section.subjects = subjects;
	await section.save();

	const studentIds = section.students || [];
	const semester = section.semester;

	for (const studentId of studentIds) {
		let grade = await Grade.findOne({
			studentId,
			semester,
		});

		if (!grade) {
			grade = new Grade({
				studentId,
				sectionId: section._id,
				semester,
				subjects: subjects.map((sub) => ({
					subjectCode: sub.subjectCode,
					subjectName: sub.subjectName,
					credits: sub.credits || 0,
				})),
			});
		} else {
			const updatedSubjects = subjects.map((sub) => {
				const existing = grade.subjects.find(
					(s) => s.subjectCode === sub.subjectCode,
				);
				return (
					existing || {
						subjectCode: sub.subjectCode,
						subjectName: sub.subjectName,
						credits: sub.credits || 0,
					}
				);
			});

			grade.subjects = updatedSubjects;
			grade.sectionId = section._id;
		}

		await grade.save();
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				section.subjects,
				"Subjects updated and synced to all students' grade sheets",
			),
		);
});

//Assign class or section to student
const assignStudentToClass = asyncHandler(async (req, res) => {
	const { studentId, classId } = req.body;

	const student = await StudentProfile.findById(studentId).populate({
		path: "studentId", // Field to populate (students is an array of ObjectIds)
		select: "firstName lastName email phone department gender ", // Specify the fields you want to select from the student profiles
	});
	if (!student) throw new ApiError(404, "Student not found");

	const classDoc = await Section.findById(classId);
	if (!classDoc) throw new ApiError(404, "Class not found");

	const semester = classDoc.semester;

	const existingGrade = await Grade.findOne({ studentId, semester });
	if (existingGrade) {
		return res
			.status(400)
			.json(
				new ApiError(
					400,
					"Grade already exists for this student in this semester",
				),
			);
	}

	const subjects = classDoc.subjects.map((s) => ({
		subjectCode: s.subjectCode,
		subjectName: s.subjectName,
		credits: s.credits || 0,
		specialCia: 0,
		cia1: 0,
		cia2: 0,
		cia3: 0,
		internalMarks: 0,
		externalMarks: 0,
		totalMarks: 0,
		totallecture: 0,
		numberOfClassAttend: 0,
		letterGrade: "",
	}));

	// Create a Grade doc for the student, linked to the Section and semester
	const grade = await Grade.create({
		studentId,
		sectionId: classDoc._id,
		semester,
		subjects,
	});

	const createdGradeDoc = await Grade.findById(grade._id);
	if (!createdGradeDoc) {
		throw new ApiError(400, "Failed to create grade document");
	}

	classDoc.students.push(studentId);
	await classDoc.save();
	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ classDoc, grade },
				"Student assigned to class and created grade succesfully ",
			),
		);
});

const updateGrade = asyncHandler(async (req, res) => {
	const { studentId, semester, subjectCode, updates, gradeId } = req.body;

	if (!studentId || !semester || !subjectCode || !updates) {
		throw new ApiError(400, "Missing required fields");
	}

	const gradeDoc = await Grade.findOne({ studentId, semester });
	if (!gradeDoc) {
		throw new ApiError(
			404,
			"Grade document not found for student and semester",
		);
	} else if (gradeDoc) {
		const subject = gradeDoc.subjects.find(
			(s) => s.subjectCode === subjectCode,
		);
		if (!subject) {
			throw new ApiError(
				404,
				`Subject ${subjectCode} not found in grade document`,
			);
		}

		// Update the fields in the subject
		Object.keys(updates).forEach((key) => {
			if (key in subject) {
				subject[key] = updates[key];
			}
		});

		// Save the document so pre-save hook recalculates totalMarks, letterGrade, sgpa
		await gradeDoc.save();
	}

	return res
		.status(200)
		.json(new ApiResponse(200, gradeDoc, "Grade updated successfully"));
});
const removeClass = asyncHandler(async (req, res) => {
	const { classId } = req.body;
	if (!classId) {
		throw new ApiError(400, "Class ID is required");
	}

	// Find the class by ID
	const classDoc = await Section.findById(classId);
	if (!classDoc) {
		throw new ApiError(404, "Class not found");
	}

	// Delete the class profile
	const remove = await Section.deleteOne({ _id: classDoc._id });
	if (remove.deletedCount === 0) {
		throw new ApiError(404, "Class profile is not removed");
	}

	res.status(200).json({ message: "Class removed successfully" });
});

//remove student from class
const removeStudentFromClass = asyncHandler(async (req, res) => {
	const { studentId, classId } = req.body;
	if (!studentId || !classId) {
		return res
			.status(400)
			.json(new ApiError(400, "Student id and Class id is required"));
	}
	try {
		const classDoc = await Section.findById(classId);
		if (!classDoc) {
			return res.status(404).json(new ApiError(404, "Class not found"));
		}

		const gradeDoc = await Grade.findOne({ studentId, sectionId: classId });
		if (gradeDoc) {
			await Grade.deleteOne({ _id: gradeDoc._id });
		}

		// Remove student from class
		classDoc.students = classDoc.students.filter(
			(id) => id.toString() !== studentId,
		);
		await classDoc.save();

		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					classDoc,
					"Student removed from class successfully",
				),
			);
	} catch (error) {
		console.log("Error removing student from class:", error);
		return res.status(500).json(new ApiError(500, "Server error"));
	}
});
//delete student account
const deleteStudent = asyncHandler(async (req, res) => {
	const { studentId, classId } = req.body;

	if (!studentId) {
		throw new ApiError(400, "StudentProfile id is required");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const studentProfile = await StudentProfile.findById(
			studentId
		).session(session);

		if (!studentProfile) {
			throw new ApiError(404, "Student profile not found");
		}

		const userId = studentProfile.studentId;

		if (classId) {
			const classDoc = await Section.findById(classId).session(session);
			if (!classDoc) {
				throw new ApiError(404, "Class not found");
			}

			classDoc.students = classDoc.students.filter(
				(id) => id.toString() !== studentId
			);

			await classDoc.save({ session });
		}

		await Grade.deleteMany(
			{ studentId: studentId },
			{ session }
		);

		await StudentProfile.deleteOne(
			{ _id: studentId },
			{ session }
		);

		await User.deleteOne(
			{ _id: userId },
			{ session }
		);

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json(
			new ApiResponse(
				200,
				null,
				"Student deleted successfully from system"
			)
		);
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
});

// delete all students from class
const deleteAllStudentsFromClass = asyncHandler(async (req, res) => {
	const { classId } = req.body;

	if (!classId) {
		throw new ApiError(400, "Class id is required");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const classDoc = await Section.findById(classId).session(session);
		if (!classDoc) {
			throw new ApiError(404, "Class not found");
		}

		if (!classDoc.students || classDoc.students.length === 0) {
			await session.abortTransaction();
			session.endSession();
			return res.status(200).json(new ApiResponse(200, null, "Class has no students to delete"));
		}

		// Find student profile IDs directly mapped in the class
		const studentProfileIds = classDoc.students;

		// Fetch profiles to get the base user IDs
		const studentProfiles = await StudentProfile.find(
			{ _id: { $in: studentProfileIds } }
		).session(session);

		const userIds = studentProfiles.map((profile) => profile.studentId);

		// Execute bulk deletions
		await Grade.deleteMany(
			{ sectionId: classId },
			{ session }
		);

		await StudentProfile.deleteMany(
			{ _id: { $in: studentProfileIds } },
			{ session }
		);

		await User.deleteMany(
			{ _id: { $in: userIds } },
			{ session }
		);

		// Clear class array and save
		classDoc.students = [];
		await classDoc.save({ session });

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json(
			new ApiResponse(200, null, "All students successfully deleted from this class")
		);
	} catch (error) {
		console.log("Error wiping all students:", error);
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
});


const getStudentProfile = asyncHandler(async (req, res) => {
	const { studentId } = req.params;
	if (!studentId) throw new ApiError(400, "Student ID is required");

	const student = await StudentProfile.findOne({ studentId }).populate({
		path: "studentId", // Field to populate (students is an array of ObjectIds)
		select: "firstName lastName email phone department gender ", // Specify the fields you want to select from the student profiles
	});
	if (!student) throw new ApiError(404, "Student not found");
	return res
		.status(200)
		.json(new ApiResponse(200, student, "Student profile fetched"));
});

const getAllasignStudent = asyncHandler(async (req, res) => {
	// const mentorId = req.user._id;
	const teacher = await TeacherProfile.findOne({ teacherId: req.user._id });
	const mentorId = teacher._id;

	const classes = await Section.findOne({ mentorId }).populate({
		path: "students", // populate the 'students' field
		populate: {
			path: "studentId", // populate 'studentId' which references the User model
			select: "firstName lastName email department role", // select the fields you want from User model
		},
	});
	if (!classes || classes.length === 0) {
		throw new ApiError(404, "Classes not found");
	}

	// Flatten all students from all sections
	// const students = classes.flatMap((s) => s.students);
	const students = classes.students;
	console.log(students);
	return res
		.status(200)
		.json(new ApiResponse(200, students, "Students fetched successfully"));
});

const createGradeForStudent = asyncHandler(async (req, res) => {
	const { studentId, sectionId, semester } = req.body;

	if (!studentId || !sectionId || !semester) {
		throw new ApiError(400, "Missing required fields");
	}

	// Check if a grade document already exists for the student in this semester
	const existingGrade = await Grade.findOne({ studentId, semester });
	if (existingGrade) {
		return res
			.status(400)
			.json(
				new ApiError(
					400,
					"Grade already exists for this student in this semester",
				),
			);
	}

	const section = await Section.findById(sectionId);
	if (!section) throw new ApiError(404, "Section not found");

	const subjects = section.subjects.map((s) => ({
		subjectCode: s.subjectCode,
		subjectName: s.subjectName,
		credits: s.credits || 0,
		specialCia: 0,
		cia1: 0,
		cia2: 0,
		cia3: 0,
		internalMarks: 0,
		externalMarks: 0,
		totalMarks: 0,
		totallecture: 0,
		numberOfClassAttend: 0,
		letterGrade: "",
	}));

	// Create a Grade doc for the student, linked to the Section and semester
	const grade = await Grade.create({
		studentId,
		sectionId,
		semester,
		subjects,
	});

	const createdGradeDoc = await Grade.findById(grade._id);
	if (!createdGradeDoc) {
		throw new ApiError(400, "Failed to create grade document");
	}

	res.status(201).json(new ApiResponse(201, createdGradeDoc, "Grade created"));
});

const updateStudent = asyncHandler(async (req, res) => {
	const { studentId, updates } = req.body;
	if (!studentId) {
		return res.status(400).json(new ApiError(400, "Student id is required"));
	}
	try {
		const student =
			await StudentProfile.findById(studentId).populate("studentId");
		if (!student) {
			return res.status(404).json(new ApiError(404, "Student not found"));
		}
		// Update student fields
		Object.keys(updates).forEach((key) => {
			if (key in student) {
				student[key] = updates[key];
			}
		});

		await student.save();
		return res
			.status(200)
			.json(new ApiResponse(200, student, "Student updated successfully"));
	} catch (error) {
		console.log("Error updating student:", error);
		return res.status(500).json(new ApiError(500, "Server error"));
	}
});

const getAlertStudentsOfClass = asyncHandler(async (req, res) => {
	const { classId } = req.params;

	if (!classId) {
		throw new ApiError(400, "Class id is required");
	}

	const classDoc = await Section.findById(classId).populate({
		path: "students",
		match: { stressAlert: true },
		populate: {
			path: "studentId",
			select: "firstName lastName email",
		},
	});

	if (!classDoc) {
		throw new ApiError(404, "Class not found");
	}

	try {
		const alertedStudents = classDoc.students || [];

		if (alertedStudents.length === 0) {
			throw new ApiError(
				404,
				"No students with stress alerts found in this class",
			);
		}

		return res.status(200).json(
			new ApiResponse(
				200,
				{
					classId: classDoc._id,
					section: classDoc.section,
					semester: classDoc.semester,
					students: alertedStudents,
				},
				"Alerted students fetched successfully",
			),
		);
	} catch (error) {
		console.log("Error fetching alerted students:", error);
		return res.status(500).json(new ApiError(500, "Server error"));
	}
});

// Get all grades for every student in a class — used by the Edit Mode sheet
const getClassGrades = asyncHandler(async (req, res) => {
	const { classId } = req.params;
	if (!classId) throw new ApiError(400, "Class ID is required");

	const classDoc = await Section.findById(classId).populate({
		path: "students",
		populate: { path: "studentId", select: "firstName lastName email" },
	});
	if (!classDoc) throw new ApiError(404, "Class not found");

	const studentProfileIds = classDoc.students.map((s) => s._id);

	// Fetch all grade docs for this class's students in one DB query
	const grades = await Grade.find({
		studentId: { $in: studentProfileIds },
		sectionId: classId,
	});

	// Index grades by studentId string for fast lookup
	const gradeMap = {};
	grades.forEach((g) => {
		gradeMap[g.studentId.toString()] = g;
	});

	const result = classDoc.students.map((profile) => ({
		profileId: profile._id,
		studentId: profile.studentId,
		admissionNo: profile.admissionNo,
		grade: gradeMap[profile._id.toString()] || null,
	}));

	return res.status(200).json(new ApiResponse(200, { students: result, subjects: classDoc.subjects }, "Class grades fetched"));
});

// Batch update grades — only updates records that have actually changed
const batchUpdateGrades = asyncHandler(async (req, res) => {
	const { updates } = req.body; // Array of { gradeId, subjects }
	if (!Array.isArray(updates) || updates.length === 0) {
		throw new ApiError(400, "No updates provided");
	}

	let successCount = 0;
	const errors = [];

	for (const update of updates) {
		try {
			const gradeDoc = await Grade.findById(update.gradeId);
			if (!gradeDoc) {
				errors.push({ gradeId: update.gradeId, error: "Grade not found" });
				continue;
			}

			// Merge subject updates
			update.subjects.forEach((updatedSubj) => {
				const existingSubj = gradeDoc.subjects.find(
					(s) => s.subjectCode === updatedSubj.subjectCode
				);
				if (existingSubj) {
					["cia1", "cia2", "cia3", "specialCia", "externalMarks"].forEach((field) => {
						if (updatedSubj[field] !== undefined) {
							existingSubj[field] = Number(updatedSubj[field]) || 0;
						}
					});
					// Update attendance
					if (updatedSubj.attendance) {
						["cia1", "cia2", "cia3"].forEach((cia) => {
							if (updatedSubj.attendance[cia]) {
								existingSubj.attendance[cia].attended = Number(updatedSubj.attendance[cia].attended) || 0;
								existingSubj.attendance[cia].total = Number(updatedSubj.attendance[cia].total) || 0;
							}
						});
					}
				}
			});

			gradeDoc.markModified("subjects");
			await gradeDoc.save();
			successCount++;
		} catch (err) {
			errors.push({ gradeId: update.gradeId, error: err.message });
		}
	}

	return res.status(200).json(
		new ApiResponse(200, { successCount, total: updates.length, errors }, `${successCount}/${updates.length} records updated`)
	);
});

// Get stress level distribution for all students in a class
const getClassStressDistribution = asyncHandler(async (req, res) => {
	const { classId } = req.params;
	if (!classId) throw new ApiError(400, "Class ID is required");

	// Fetch the class with its student profiles
	const classDoc = await Section.findById(classId).populate({
		path: "students",
		populate: { path: "studentId", select: "firstName lastName email" },
	});
	if (!classDoc) throw new ApiError(404, "Class not found");

	// Filter out nulls (orphaned records) and collect user IDs
	const validStudents = classDoc.students.filter(s => s !== null);
	const studentUserIds = validStudents
		.map((s) => s.studentId?._id || s.studentId)
		.filter((id) => id && mongoose.Types.ObjectId.isValid(id.toString()))
		.map((id) => new mongoose.Types.ObjectId(id.toString()));

	console.log(`[StressAnalytics] Class: ${classId}, Total Students: ${classDoc.students.length}, Valid Profiles: ${validStudents.length}, User IDs: ${studentUserIds.length}`);

	// For each student, get their most recent Response document
	const latestResponses = await Response.aggregate([
		{ 
			$match: { 
				studentId: { $in: studentUserIds } 
			} 
		},
		{ $sort: { createdAt: -1 } },
		{
			$group: {
				_id: "$studentId",
				stressIndex: { $first: "$stressIndex" },
				latestAt: { $first: "$createdAt" },
			},
		},
	]);

	console.log(`[StressAnalytics] Latest responses found: ${latestResponses.length}`);

	// Build a map: userId -> stressIndex
	const stressMap = {};
	latestResponses.forEach((r) => {
		stressMap[r._id.toString()] = r.stressIndex;
	});

	// Count distribution: levels 1-5
	const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	const studentData = [];

	validStudents.forEach((profile) => {
		const uId = profile.studentId?._id || profile.studentId;
		if (!uId) return;
		
		const userIdStr = uId.toString();
		const level = stressMap[userIdStr];
		
		if (level !== undefined && level !== null) {
			const roundedLevel = Math.round(Number(level));
			if (roundedLevel >= 1 && roundedLevel <= 5) {
				distribution[roundedLevel]++;
			}
		}

		studentData.push({
			profileId: profile._id,
			studentId: uId,
			firstName: profile.studentId?.firstName || "Unknown",
			lastName: profile.studentId?.lastName || "",
			email: profile.studentId?.email || "",
			admissionNo: profile.admissionNo,
			stressAlert: profile.stressAlert,
			stressIndex: level !== undefined ? Number(level) : null,
		});
	});

	const surveysCompleted = latestResponses.length;

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				totalStudents: classDoc.students.length,
				surveysCompleted,       
				distribution,      
				students: studentData,
			},
			"Stress distribution fetched successfully",
		),
	);
});

export {
	addMentor,
	updateMentorProfile,
	getMentorProfile,
	assignStudentToClass,
	getStudentProfile,
	updateGrade,
	// updateAttendance,
	addSubjectsToSection,
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
};
