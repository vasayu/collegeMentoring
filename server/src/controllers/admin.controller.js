import mongoose from "mongoose";
import {
	User,
	AdminProfile,
	TeacherProfile,
	StudentProfile,
	Question,
	Section,
	CounselorProfile,
	Subject,
} from "../models/models.index.js";
import { ApiError, ApiResponse } from "../utils/index.js";

const createAdminProfile = async (req, res) => {
	let { firstName, lastName, email, password, department, employeeId } =
		req.body;
	email = email?.toLowerCase();

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new ApiError(400, "User with this email already exists");
	}
	const existingAdmin = await AdminProfile.findOne({ employeeId });
	if (existingAdmin) {
		throw new ApiError(400, "Admin with this employee ID already exists");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	let adminProfile;

	try {
		// Attach session
		const user = await User.create(
			[
				{
					role: 2,
					firstName,
					lastName,
					email,
					password,
					department,
				},
			],
			{ session }
		);

		adminProfile = await AdminProfile.create(
			[
				{
					adminId: user[0]._id,
					employeeId,
					designation: "Head of Department",
				},
			],
			{ session }
		);

		// Save both
		await session.commitTransaction();
		session.endSession();
	} catch (error) {
		// Undo everything
		await session.abortTransaction();
		session.endSession();
		console.log(error);
	}

	const createdAdminProfile = await AdminProfile.findById(
		adminProfile[0]._id
	).select("-password -refreshToken");

	if (!createdAdminProfile)
		throw new ApiError(400, "Failed to create admin profile");
	res
		.status(201)
		.json(new ApiResponse(201, { createdAdminProfile }, "Admin created"));
};

const getAdminProfile = async (req, res) => {
	const id = req.user._id;
	if (!id) {
		throw new ApiError(403, "id is required");
	}
	const profile = await AdminProfile.findOne({ adminId: id }).populate(
		"adminId",
		"firstName lastName email phone gender role dob department"
	);
	if (!profile) throw new ApiError(404, "Admin profile not found");

	res.status(200).json(new ApiResponse(200, profile, "Admin profile fetched"));
};

const updateAdminProfile = async (req, res) => {
	const { firstName, lastName, email, phone, designation, address } = req.body;
	if (!req.user._id) {
		throw new ApiError(403, "id is required");
	}

	// 1. Update User Record
	const userUpdates = {};
	if (firstName !== undefined) userUpdates.firstName = firstName;
	if (lastName !== undefined) userUpdates.lastName = lastName;
	if (email !== undefined) userUpdates.email = email;
	if (phone !== undefined) userUpdates.phone = phone;

	if (Object.keys(userUpdates).length > 0) {
		await User.findByIdAndUpdate(req.user._id, userUpdates, { runValidators: true });
	}

	// 2. Update Admin Profile
	const adminUpdates = {};
	if (designation !== undefined) adminUpdates.designation = designation;
	if (address !== undefined) adminUpdates.address = address;

	let profile;
	if (Object.keys(adminUpdates).length > 0) {
		profile = await AdminProfile.findOneAndUpdate(
			{ adminId: req.user._id },
			adminUpdates,
			{ new: true, runValidators: true }
		).populate("adminId", "firstName lastName email phone gender role dob department");
	} else {
		profile = await AdminProfile.findOne({ adminId: req.user._id })
			.populate("adminId", "firstName lastName email phone gender role dob department");
	}

	if (!profile) throw new ApiError(404, "Admin profile not found");
	res.json(new ApiResponse(200, profile, "Admin profile updated"));
};

// Assign mentor to class
const assignMentorToClass = async (req, res) => {
	const { mentorId, classId } = req.body;

	if (!mentorId || !classId) {
		throw new ApiError(400, "Mentor ID and Class ID are required");
	}

	const mentor = await TeacherProfile.findById(mentorId);
	if (!mentor) throw new ApiError(404, "Mentor not found");

	const classDoc = await Section.findByIdAndUpdate(
		classId,
		{ mentorId },
		{ new: true }
	).populate({
		path: "mentorId",
		populate: {
			path: "teacherId",
			select: "firstName lastName email phone department",
		},
	});
	if (!classDoc) throw new ApiError(404, "Class not found");

	// Update mentor profile to include the class if not already added
	if (!mentor.classesHandled.includes(classId)) {
		mentor.classesHandled = [classId];
		await mentor.save();
	}

	res
		.status(200)
		.json(new ApiResponse(200, classDoc, "Mentor assigned to class"));
};
const createClass = async (req, res) => {
	const { section, academicStartYear, semester } = req.body;
	const department = req.user.department;
	if (!section || !academicStartYear || !semester) {
		throw new ApiError(400, "All fields are required");
	}
	const existingClass = await Section.findOne({
		academicStartYear,
		section,
		department,
		semester,
	});
	if (existingClass) {
		throw new ApiError(400, "Class with this section already exists");
	}
	const classDoc = await Section.create({
		section,
		academicStartYear,
		department,
		semester,
	});
	if (!classDoc) throw new ApiError(400, "Failed to create class");
	res
		.status(201)
		.json(new ApiResponse(201, classDoc, "Class created successfully"));
};
const getClassById = async (req, res) => {
	const { id } = req.params;
	if (!id) {
		throw new ApiError(400, "Class ID is required");
	}
	// const classDoc = await Section.findById(id);

	const classDoc = await Section.findById(id)
		.populate({
			path: "students", // populate the 'students' field
			populate: {
				path: "studentId", // populate 'studentId' which references the User model
				select: "firstName lastName email department role", // select the fields you want from User model
			},
		})
		.populate({
			path: "mentorId", // Assuming the teacher's ID is in the 'mentorId' field
			select:
				"specialization employeeId designation qualifications yearsOfExperience address",
			populate: {
				path: "teacherId",
				select: "firstName lastName email phone department gender",
			},
		});
	if (!classDoc) throw new ApiError(404, "Class not found");
	res
		.status(200)
		.json(new ApiResponse(200, classDoc, "Class fetched successfully"));
};
const updateClassDeatils = async (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	if (!id) {
		throw new ApiError(400, "Class ID is required");
	}
	if (updates.length === 0) {
		throw new ApiError(400, "No updates provided");
	}
	const classDoc = await Section.findByIdAndUpdate(id, updates, {
		new: true,
	});
	if (!classDoc) throw new ApiError(404, "Class not found");

	res
		.status(200)
		.json(new ApiResponse(200, classDoc, "Class updated successfully"));
};
const getAllMentorOfDepartment = async (req, res) => {
	const { department, role } = req.user;

	const mentors = await TeacherProfile.find().populate(
		"teacherId",
		"firstName lastName email phone gender role dob department"
	);

	// Role 4 (Master Admin) gets all mentors across all departments
	const result = role === 4
		? mentors.filter(m => m.teacherId) // just exclude orphaned records
		: mentors.filter((mentor) => mentor.teacherId?.department === department);

	res
		.status(200)
		.json(new ApiResponse(200, result, "Mentors fetched successfully"));
};
const getAllClassesOfDepartment = async (req, res) => {
	const { department, role } = req.user;
	
	let query = {};
	if (role === 2) {
		// HODs only see classes in their department
		query = { department };
	}
	// Counselors see all classes

	const classes = await Section.find(query)
		.populate({
			path: "students", // Field to populate (students is an array of ObjectIds)
			select: "firstName lastName email phone department gender ", // Specify the fields you want to select from the student profiles
		})
		.populate({
			path: "mentorId", // Assuming the teacher's ID is in the 'mentorId' field
			select:
				"specialization employeeId designation qualifications yearsOfExperience address",
			populate: {
				path: "teacherId",
				select: "firstName lastName email phone department gender",
			},
		});

	res
		.status(200)
		.json(new ApiResponse(200, classes, "Classes fetched successfully"));
};
const getAllStudentsOfDepartment = async (req, res) => {
	const { department, role } = req.user;

	const students = await StudentProfile.find().populate(
		"studentId",
		"firstName lastName email phone gender role dob department"
	);

	// Role 4 (Master Admin) gets all students across all departments
	const result = role === 4
		? students.filter(s => s.studentId) // exclude orphaned records
		: students.filter((student) => student.studentId?.department === department);

	res
		.status(200)
		.json(
			new ApiResponse(200, result, "Students fetched successfully")
		);
};

// get all counselors
const getAllCounselors = async (req, res) => {
	const counselors = await CounselorProfile.find().populate(
		"counselorId",
		"firstName lastName email phone gender role dob department"
	);

	res
		.status(200)
		.json(new ApiResponse(200, counselors, "Counselors fetched successfully"));
};

//Create questions
const createQuestion = async (req, res) => {
	const { text, type, options, measure } = req.body;
	const createdBy = req.user._id;

	if (!text || !type) {
		throw new ApiError(400, "Question text and type are required");
	}

	// Validate options based on type
	if (type === "MCQ" && (!options || options.length === 0)) {
		throw new ApiError(400, "MCQ questions must have at least one option");
	}
	if ((type === "text" || type === "rating") && options?.length) {
		throw new ApiError(400, `${type} questions should not have options`);
	}

	const question = await Question.create({
		text,
		type,
		measure,
		options: type === "MCQ" ? options : [],
		createdBy,
	});

	res
		.status(201)
		.json(new ApiResponse(201, question, "Question created successfully"));
};

//get all questions
const getAllQuestions = async (req, res) => {
	const questions = await Question.find().populate(
		"createdBy",
		"firstName lastName email department"
	); // show admin info

	res
		.status(200)
		.json(new ApiResponse(200, questions, "Questions fetched successfully"));
};
//get all question by id
const getQuestionById = async (req, res) => {
	const { id } = req.params;
	if (!id) throw new ApiError(400, "Question ID is required");

	const question = await Question.findById(id).populate(
		"createdBy",
		"firstName lastName email"
	);

	if (!question) throw new ApiError(404, "Question not found");

	res.status(200).json(new ApiResponse(200, question, "Question fetched"));
};

//get all question by id
// const alertStudents = async (req, res) => {
//   try {
//     // Find all students with stressAlert = true
//     const students = await StudentProfile.find({ stressAlert: true }).populate(
//       "studentId",
//       "firstName lastName email"
//     );

//     if (!students || students.length === 0) {
//       throw new ApiError(404, "No students with stress alerts found");
//     }

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           students,
//           "Students with stress alerts fetched successfully"
//         )
//       );
//   } catch (error) {
//     console.error(error);
//     return res.status(error.statusCode || 500).json({
//       success: false,
//       message: error.message || "Server error",
//     });
//   }
// };

const getAlertStudentsByFilter = async (req, res) => {
	const { search, semester } = req.body;
	
	try {
		const pipeline = [];

		// 1. Filter by stressAlert: true FIRST (efficient)
		pipeline.push({
			$match: { stressAlert: true }
		});

		// 2. Lookup user details to enable searching by name/email
		pipeline.push({
			$lookup: {
				from: "users",
				localField: "studentId",
				foreignField: "_id",
				as: "userDetails"
			}
		});
		pipeline.push({ $unwind: "$userDetails" });

		// 3. Lookup grade to get the actual semester (StudentProfile.semester is empty)
		pipeline.push({
			$lookup: {
				from: "grades",
				localField: "_id",
				foreignField: "studentId",
				as: "gradeInfo"
			}
		});
		// Add a computed field: take semester from first grade record
		pipeline.push({
			$addFields: {
				gradeSemester: { $arrayElemAt: ["$gradeInfo.semester", 0] }
			}
		});

		// 4. Filter by semester using grade data (if provided)
		if (semester && semester !== "all") {
			pipeline.push({
				$match: { gradeSemester: Number(semester) }
			});
		}

		// 5. Apply search filter if provided
		if (search && search.trim()) {
			const searchRegex = new RegExp(search.trim(), "i");
			pipeline.push({
				$match: {
					$or: [
						{ admissionNo: searchRegex },
						{ "userDetails.firstName": searchRegex },
						{ "userDetails.lastName": searchRegex },
						{ "userDetails.email": searchRegex }
					]
				}
			});
		}

		// 6. Project the final output shape
		pipeline.push({
			$project: {
				_id: 1,
				admissionNo: 1,
				semester: "$gradeSemester",
				stressAlert: 1,
				studentId: {
					_id: "$userDetails._id",
					firstName: "$userDetails.firstName",
					lastName: "$userDetails.lastName",
					email: "$userDetails.email"
				}
			}
		});

		pipeline.push({ $limit: 100 });

		const students = await StudentProfile.aggregate(pipeline);

		if (!students || students.length === 0) {
			return res
				.status(200)
				.json(new ApiResponse(200, [], "No students with stress alerts found"));
		}

		return res
			.status(200)
			.json(new ApiResponse(200, students, "Filtered students with stress alerts fetched successfully"));
	} catch (error) {
		console.error("Aggregation error:", error);
		return res.status(500).json(new ApiError(500, "Server error during student search"));
	}
};

const addSubject = async (req, res) => {
	const {
		subjectName,
		subjectCode,
		semester,
		credits,
		type,
		assignedTeachers,
	} = req.body;

	if (!subjectName || !subjectCode || !semester) {
		throw new ApiError(400, "Subject name, code, and semester are required");
	}


	const existingSubject = await Subject.findOne({ subjectCode });
	if (existingSubject) {
		throw new ApiError(400, "Subject with this code already exists");
	}

	const subject = await Subject.create({
		subjectName,
		subjectCode,
		semester,
		credits,
		type,
		assignedTeachers,
	});

	res
		.status(201)
		.json(new ApiResponse(201, subject, "Subject created successfully"));
};

const getSubjects = async (req, res) => {
	try {
		const subjects = await Subject.find()
			.populate(
				"assignedTeachers",
				"specialization employeeId designation qualifications yearsOfExperience address"
			)
			.sort({ semester: 1, subjectCode: 1 });

		if (!subjects || subjects.length === 0) {
			return res
				.status(404)
				.json(new ApiError(404, "No subjects found"));
		}

		return res.status(200).json(
			new ApiResponse(
				200,
				subjects,
				"Subjects fetched successfully"
			)
		);
	} catch (error) {
		console.error("Error fetching subjects:", error);
		return res
			.status(500)
			.json(new ApiError(500, "Server error"));
	}
};


//update question
const updateQuestion = async (req, res) => {
	const { id } = req.params;
	const { text, type, options } = req.body;

	if (!id) throw new ApiError(400, "Question ID is required");
	if (!text && !type && !options)
		throw new ApiError(400, "No updates provided");

	// Validate options based on type if type is being updated
	if (type === "MCQ" && (!options || options.length === 0)) {
		throw new ApiError(400, "MCQ questions must have at least one option");
	}
	if ((type === "text" || type === "rating") && options?.length) {
		throw new ApiError(400, `${type} questions should not have options`);
	}

	const updates = { text, type };
	if (type === "MCQ") updates.options = options;

	const question = await Question.findByIdAndUpdate(id, updates, {
		new: true,
		runValidators: true,
	});

	if (!question) throw new ApiError(404, "Question not found");

	res.status(200).json(new ApiResponse(200, question, "Question updated"));
};

//delete question
const deleteQuestion = async (req, res) => {
	const { id } = req.params;
	if (!id) throw new ApiError(400, "Question ID is required");

	const question = await Question.findByIdAndDelete(id);
	if (!question) throw new ApiError(404, "Question not found");

	res.status(200).json(new ApiResponse(200, question, "Question deleted"));
};

//delete mentor
const deleteMentor = async (req, res) => {
	const { mentorId } = req.body;
	if (!mentorId) {
		throw new ApiError(400, "Mentor ID is required");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const mentorProfile = await TeacherProfile.findById(mentorId).session(session);
		if (!mentorProfile) {
			throw new ApiError(404, "Mentor profile not found");
		}

		const userId = mentorProfile.teacherId;

		// Unassign from all classes
		await Section.updateMany(
			{ mentorId: mentorId },
			{ $unset: { mentorId: 1 } },
			{ session }
		);

		// Delete the profiles and users
		await TeacherProfile.deleteOne({ _id: mentorId }, { session });
		await User.deleteOne({ _id: userId }, { session });

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json(new ApiResponse(200, null, "Mentor deleted successfully"));
	} catch (error) {
		console.log("Error deleting mentor:", error);
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

//delete counselor
const deleteCounselor = async (req, res) => {
	const { counselorId } = req.body;
	if (!counselorId) {
		throw new ApiError(400, "Counselor ID is required");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const counselorProfile = await CounselorProfile.findById(counselorId).session(session);
		if (!counselorProfile) {
			throw new ApiError(404, "Counselor profile not found");
		}

		const userId = counselorProfile.counselorId;

		// Delete the profiles and users
		await CounselorProfile.deleteOne({ _id: counselorId }, { session });
		await User.deleteOne({ _id: userId }, { session });

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json(new ApiResponse(200, null, "Counselor deleted successfully"));
	} catch (error) {
		console.log("Error deleting counselor:", error);
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

//delete admin (Master Admin only)
const deleteAdmin = async (req, res) => {
	const { adminProfileId } = req.body;
	if (!adminProfileId) {
		throw new ApiError(400, "Admin Profile ID is required");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const adminProfile = await AdminProfile.findById(adminProfileId).session(session);
		if (!adminProfile) {
			throw new ApiError(404, "Admin profile not found");
		}

		const userId = adminProfile.adminId;

		// Delete the profiles and users
		await AdminProfile.deleteOne({ _id: adminProfileId }, { session });
		await User.deleteOne({ _id: userId }, { session });

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json(new ApiResponse(200, null, "Admin deleted successfully by Master Admin"));
	} catch (error) {
		console.log("Error deleting admin by Master Admin:", error);
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

// --- MASTER ADMIN (ROLE 4) SPECIAL FEATURES ---

// 1. Display All Admins of All Departments
const getAllAdmins = async (req, res) => {
	// Only fetch role 2 (Admin/HOD). We can also include 4 if needed, 
	// but usually a Master Admin wants to manage department admins.
	const admins = await AdminProfile.find().populate(
		"adminId",
		"firstName lastName email phone gender role dob department"
	);

	res.status(200).json(new ApiResponse(200, admins, "All admins fetched successfully"));
};

// 2. View Specific Admin
const getAdminById = async (req, res) => {
	const { id } = req.params; // This is the AdminProfile ID
	if (!id) throw new ApiError(400, "Admin Profile ID is required");

	const admin = await AdminProfile.findById(id).populate(
		"adminId",
		"firstName lastName email phone gender role dob department"
	);

	if (!admin) throw new ApiError(404, "Admin profile not found");

	res.status(200).json(new ApiResponse(200, admin, "Admin profile fetched successfully"));
};

// 3. Update Admin (Master Admin can update anyone)
const updateAdminById = async (req, res) => {
	const { id } = req.params; // AdminProfile ID
	const { firstName, lastName, email, phone, designation, department, gender, dob, role } = req.body;

	if (!id) throw new ApiError(400, "Admin Profile ID is required");

	const adminProfile = await AdminProfile.findById(id);
	if (!adminProfile) throw new ApiError(404, "Admin profile not found");

	const userId = adminProfile.adminId;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Update User fields
		const userUpdates = {};
		if (firstName !== undefined) userUpdates.firstName = firstName;
		if (lastName !== undefined) userUpdates.lastName = lastName;
		if (email !== undefined) userUpdates.email = email?.toLowerCase();
		if (phone !== undefined) userUpdates.phone = phone;
		if (department !== undefined) userUpdates.department = department;
		if (gender !== undefined) userUpdates.gender = gender;
		if (dob !== undefined) userUpdates.dob = dob;
		if (role !== undefined) userUpdates.role = role;

		if (Object.keys(userUpdates).length > 0) {
			await User.findByIdAndUpdate(userId, userUpdates, { session, runValidators: true });
		}

		// Update AdminProfile fields
		const profileUpdates = {};
		if (designation !== undefined) profileUpdates.designation = designation;

		let updatedProfile;
		if (Object.keys(profileUpdates).length > 0) {
			updatedProfile = await AdminProfile.findByIdAndUpdate(
				id,
				profileUpdates,
				{ session, new: true, runValidators: true }
			).populate("adminId", "firstName lastName email phone gender role dob department");
		} else {
			updatedProfile = await AdminProfile.findById(id).populate(
				"adminId",
				"firstName lastName email phone gender role dob department"
			);
		}

		await session.commitTransaction();
		session.endSession();

		res.status(200).json(new ApiResponse(200, updatedProfile, "Admin updated successfully by Master Admin"));
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error("Error updating admin by Master Admin:", error);
		throw new ApiError(error.statusCode || 500, error.message || "Failed to update admin profile");
	}
};

export {
	createAdminProfile,
	getAdminProfile,
	updateAdminProfile,
	assignMentorToClass,
	createClass,
	getClassById,
	updateClassDeatils,
	getAllMentorOfDepartment,
	getAllClassesOfDepartment,
	getAllStudentsOfDepartment,
	createQuestion,
	getAllQuestions,
	getQuestionById,
	updateQuestion,
	deleteQuestion,
	getAllCounselors,
	//   alertStudents,
	getAlertStudentsByFilter,
	addSubject,
	getSubjects,
	deleteMentor,
	deleteCounselor,
	getAllAdmins,
	getAdminById,
	updateAdminById,
	deleteAdmin,
};
