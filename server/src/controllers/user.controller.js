// import { User } from "../models/user.model.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import {
	StudentProfile,
	TeacherProfile,
	CounselorProfile,
	AdminProfile,
    Section,
	Grade,
	User,
} from "../models/models.index.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import fs from "fs";
import bcrypt from "bcrypt";

// Generate Access and Refresh Tokens
const gernateAccessAndRefreshTokens = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(500, "Something went wrong while generating tokens");
	}
};

// ------------------- Student ------------------- //
const creatingStudentProfile = asyncHandler(async (req, res) => {
	let {
		firstName,
		lastName,
		email,
		password,
		admissionNo,
		phone,
		dob,
		yearOfAdmission,
		program,
		gender,
	} = req.body;
	email = email?.toLowerCase();

	if (!firstName || !email || !password || !admissionNo) {
		throw new ApiError(400, "All fields are required");
	}

	const existingUser = await User.findOne({ email });

	if (existingUser)
		throw new ApiError(400, "User with this email already exists");

	const existingAdmission = await StudentProfile.findOne({ admissionNo });
	if (existingAdmission) {
		throw new ApiError(400, "Admission number already exists");
	}

	if (!req.user?.department) {
		throw new ApiError(400, "Department not found");
	}
	const department = req.user?.department;

	// this is for create 2 profile if one's fail reject other one from db

	const session = await mongoose.startSession();
	session.startTransaction();

	let studentProfile;

	try {
		const user = await User.create(
			[
				{
					role: 0,
					firstName,
					lastName,
					email,
					password,
					phone,
					dob,
					department: req.user.department,
					gender,
				},
			],
			{ session },
		);

		studentProfile = await StudentProfile.create(
			[
				{
					studentId: user[0]._id,
					admissionNo,
					program,
					yearOfAdmission,
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

	const createdStudentProfile = await StudentProfile.findOne({
		studentId: studentProfile[0].studentId,
	}).populate(
		"studentId",
		"firstName lastName email phone gender role dob department",
	);

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				{ createdStudentProfile },
				"Student created successfully",
			),
		);
});

const createStudentsByUpload = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "File not received");
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const classId = req.body.classId;
    const session = await mongoose.startSession();
    session.startTransaction();

	const finalData = XLSX.utils.sheet_to_json(
		workbook.Sheets[sheetName],
		{
			range: 5, 
			header: 1 
		}
	);

    try {
		const classDoc = await Section.findById(classId).session(session);
		if (!classDoc) {
			throw new ApiError(404, "Class not found");
		}

		const semester = classDoc.semester;
		const department = classDoc.department;
		const yearOfAdmission = classDoc.academicStartYear;
		const section = classDoc.section;

		// 1. Pre-process Excel data and collect identifiers for bulk checking
		const processedRows = [];
		const allEmails = new Set();
		const allAdmissionNos = new Set();

		for (const row of finalData) {
			if (!row || row.length < 4) continue;

			const sectionFromRow = row[1];
			const admissionNoRaw = row[2];
			const fullName = row[3]?.trim();

			const admissionNo = admissionNoRaw
				? admissionNoRaw.toLocaleString('fullwide', { useGrouping: false })
				: null;

			if (!admissionNo || !fullName) continue;

			const email = `${admissionNo}@jssaten.ac.in`.toLowerCase();
			
			// Skip duplicates within the Excel file itself
			if (allEmails.has(email) || allAdmissionNos.has(admissionNo)) continue;

			const nameParts = fullName.split(" ");
			const firstName = nameParts[0];
			const lastName = nameParts.slice(1).join(" ");
			let password = admissionNo;
			if (password.length < 6) password = password.padEnd(6, '0');

			processedRows.push({
				firstName,
				lastName,
				email,
				password,
				admissionNo,
				sectionFromRow
			});
			allEmails.add(email);
			allAdmissionNos.add(admissionNo);
		}

		if (processedRows.length === 0) {
			throw new ApiError(400, "No valid student data found in Excel");
		}

		// 2. Bulk check database for existing records
		const existingUsers = await User.find({ email: { $in: Array.from(allEmails) } }).session(session).select("email");
		const existingProfiles = await StudentProfile.find({ admissionNo: { $in: Array.from(allAdmissionNos) } }).session(session).select("admissionNo");

		const existingEmailSet = new Set(existingUsers.map(u => u.email));
		const existingAdmissionSet = new Set(existingProfiles.map(p => p.admissionNo));

		// 3. Prepare batch arrays
		const usersToCreate = [];
		const profilesToCreate = [];
		const gradesToCreate = [];
		const newStudentProfileIds = [];

		const subjectTemplates = classDoc.subjects.map((s) => ({
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
			attendance: {
				cia1: { attended: 0, total: 0 },
				cia2: { attended: 0, total: 0 },
				cia3: { attended: 0, total: 0 },
			},
			letterGrade: "",
		}));

		for (const data of processedRows) {
			if (existingEmailSet.has(data.email) || existingAdmissionSet.has(data.admissionNo)) {
				console.log(`Skipping existing student: ${data.email} / ${data.admissionNo}`);
				continue;
			}

			const userId = new mongoose.Types.ObjectId();
			const profileId = new mongoose.Types.ObjectId();

			const hashedEmailPassword = await bcrypt.hash(data.password, 10);

			usersToCreate.push({
				_id: userId,
				role: 0,
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				password: hashedEmailPassword,
				department,
			});

			profilesToCreate.push({
				_id: profileId,
				studentId: userId,
				admissionNo: data.admissionNo,
				yearOfAdmission,
			});

			gradesToCreate.push({
				studentId: profileId,
				sectionId: classId,
				semester,
				subjects: JSON.parse(JSON.stringify(subjectTemplates)), // Deep clone templates
			});

			newStudentProfileIds.push(profileId);
		}

		// 4. Perform batch insertions
		if (usersToCreate.length > 0) {
			await User.insertMany(usersToCreate, { session });
			await StudentProfile.insertMany(profilesToCreate, { session });
			await Grade.insertMany(gradesToCreate, { session });

			// 5. Update class document
			classDoc.students.push(...newStudentProfileIds);
			await classDoc.save({ session });
		}

		await classDoc.save({ session });

		await session.commitTransaction();
		session.endSession();

		fs.unlinkSync(req.file.path);

		return res.status(200).json(
			new ApiResponse(
				200,
				{ classDoc },
				"Students created successfully from Excel"
			)
		);
	} catch (error) {
		console.error("====== EXCEL UPLOAD ERROR ======", error);
		if (session.inTransaction()) {
			await session.abortTransaction();
		}
		session.endSession();

		if (fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		throw error;
	}
});

// Update Student Profile
const updateStudentProfile = asyncHandler(async (req, res) => {
	const { studentId } = req.params;
	const updates = req.body;

	if (!studentId) throw new ApiError(400, "Student ID is required");
	if (Object.keys(updates).length === 0)
		throw new ApiError(400, "No updates provided");

	const profile = await StudentProfile.findOneAndUpdate(
		{ studentId },
		updates,
		{ new: true },
	);
	if (!profile) throw new ApiError(404, "Student profile not found");

	return res
		.status(200)
		.json(new ApiResponse(200, profile, "Profile updated successfully"));
});

// ------------------- Counselor ------------------- //
const creatingCounselorProfile = asyncHandler(async (req, res) => {
	let { firstName, lastName, email, password, phone, employeeId } = req.body;
	email = email?.toLowerCase();

	if (!firstName || !email || !password || !employeeId) {
		throw new ApiError(400, "Required fields are missing");
	}

	//  Prevent duplicate counselor
	const existingCounselor = await User.findOne({ role: 3 });
	if (existingCounselor) {
		throw new ApiError(400, "Only one counselor is allowed");
	}

	//  Prevent duplicate email
	if (await User.findOne({ email })) {
		throw new ApiError(400, "User with this email already exists");
	}

	//  Prevent duplicate employeeId
	if (await CounselorProfile.findOne({ employeeId })) {
		throw new ApiError(400, "Employee ID already exists");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	let counselorProfile;

	try {
		const user = await User.create(
			[
				{
					role: 3,
					firstName,
					lastName,
					email,
					password,
					phone,
				},
			],
			{ session },
		);

		counselorProfile = await CounselorProfile.create(
			[
				{
					counselorId: user[0]._id,
					employeeId,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		session.endSession();
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		throw error;
	}

	const createdCounselorProfile = await CounselorProfile.findOne({
		counselorId: counselorProfile[0].counselorId,
	}).populate(
		"counselorId",
		"firstName lastName email phone gender role department",
	);

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				{ createdCounselorProfile },
				"Counselor created successfully",
			),
		);
});

// ------------------- Self-Update ------------------- //
const updateCurrentUser = asyncHandler(async (req, res) => {
	const { firstName, lastName, email, phone, gender, dob } = req.body;
	const userId = req.user._id;

	const updates = {};
	if (firstName !== undefined) updates.firstName = firstName;
	if (lastName !== undefined) updates.lastName = lastName;
	if (email !== undefined) updates.email = email.toLowerCase().trim();
	if (phone !== undefined) updates.phone = phone;
	if (gender !== undefined) updates.gender = gender;
	if (dob !== undefined) updates.dob = dob;

	if (Object.keys(updates).length === 0) {
		throw new ApiError(400, "No fields provided to update");
	}

	const updatedUser = await User.findByIdAndUpdate(userId, updates, {
		new: true,
		runValidators: true,
	}).select("-password -refreshToken");

	if (!updatedUser) throw new ApiError(404, "User not found");

	return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

// ------------------- Auth ------------------- //
const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) throw new ApiError(400, "All fields are required");

	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const isPasswordCorrect = await user.isPasswordCorrect(password);
	if (!isPasswordCorrect) throw new ApiError(401, "Invalid Credentials");

	const { accessToken, refreshToken } = await gernateAccessAndRefreshTokens(
		user._id,
	);

	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);
	let profile = null;

	if (loggedInUser.role === 0) {
		profile = await StudentProfile.findOne({
			studentId: loggedInUser._id,
		}).populate(
			"studentId",
			"firstName lastName email phone gender role dob department",
		);
	} else if (loggedInUser.role === 1) {
		profile = await TeacherProfile.findOne({
			teacherId: loggedInUser._id,
		}).populate(
			"teacherId",
			"firstName lastName email phone gender role dob department",
		);
	} else if (loggedInUser.role === 2 || loggedInUser.role === 4) {
		profile = await AdminProfile.findOne({
			adminId: loggedInUser._id,
		}).populate(
			"adminId",
			"firstName lastName email phone gender role dob department",
		);
	} else if (loggedInUser.role === 3) {
		profile = await CounselorProfile.findOne({
			counselorId: loggedInUser._id,
		}).populate(
			"counselorId",
			"firstName lastName email phone gender role dob department",
		);
	}

	const options = {
		secure: true,
		httpOnly: true,
		sameSite: "None",
		maxAge: 24 * 60 * 60 * 1000,
	};
	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(200, { user: profile }, "User logged in successfully"),
		);
});

const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{ $unset: { refreshToken: 1 } },
		{ new: true },
	);
	const options = { secure: true, httpOnly: true, sameSite: "none" };
	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	if (!oldPassword || !newPassword) {
		throw new ApiError(400, "Both old and new passwords are required");
	}

	if (newPassword.length < 6) {
		throw new ApiError(400, "New password must be at least 6 characters long");
	}

	if (oldPassword === newPassword) {
		throw new ApiError(400, "New password cannot be the same as the old password");
	}

	const user = await User.findById(req.user?._id);
	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
	if (!isPasswordCorrect) {
		throw new ApiError(400, "Invalid old password");
	}

	user.password = newPassword;
	await user.save();

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
	const loggedInUser = req.user;
	let profile = null;

	if (loggedInUser.role === 0) {
		profile = await StudentProfile.findOne({
			studentId: loggedInUser._id,
		}).populate(
			"studentId",
			"firstName lastName email phone gender role dob department",
		);
	} else if (loggedInUser.role === 1) {
		profile = await TeacherProfile.findOne({
			teacherId: loggedInUser._id,
		}).populate(
			"teacherId",
			"firstName lastName email phone gender role dob department",
		);
	} else if (loggedInUser.role === 2 || loggedInUser.role === 4) {
		profile = await AdminProfile.findOne({
			adminId: loggedInUser._id,
		}).populate(
			"adminId",
			"firstName lastName email phone gender role dob department",
		);
	} else if (loggedInUser.role === 3) {
		profile = await CounselorProfile.findOne({
			counselorId: loggedInUser._id,
		}).populate(
			"counselorId",
			"firstName lastName email phone gender role dob department",
		);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, profile, "Current user fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
	const { userId } = req.body;
	if (!userId) throw new ApiError(400, "User ID is required");

	const user = await User.findById(userId).select("-password -refreshToken");
	if (!user) throw new ApiError(404, "User not found");

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User fetched successfully"));
});

// ------------------- Exports ------------------- //
const removeStudentFromCollege = asyncHandler(async (req, res) => {
	const { studentId } = req.body;
	if (!studentId) {
		throw new ApiError(400, "Student ID is required");
	}
	// Find the student by ID
	const student = await StudentProfile.findById(studentId);
	if (!student) {
		throw new ApiError(404, "Student not found");
	}

	// Delete the associated user
	const removeUser = await User.deleteOne({ _id: student.studentId }); // Assuming student.studentId references the User's _id

	if (removeUser.deletedCount === 0) {
		throw new ApiError(404, "User is not removed");
	}

	// Delete the student profile
	const remove = await StudentProfile.deleteOne({ _id: student._id });
	if (remove.deletedCount === 0) {
		throw new ApiError(404, "Student profile is not removed");
	}

	res.status(200).json({ message: "Student removed successfully" });
});

const getStudentByAdmissionNo = asyncHandler(async (req, res) => {
	const { query } = req.body;
	const { department, role } = req.user;

	if (!query || !query.trim()) {
		throw new ApiError(400, "Search query is required");
	}
	const searchRegex = new RegExp(query.trim(), "i");

	const pipeline = [
		{
			$lookup: {
				from: "users",
				localField: "studentId",
				foreignField: "_id",
				as: "student",
			},
		},
		{ $unwind: "$student" },
		// Role 2 (HOD): restrict to own department only
		...(role === 2
			? [{ $match: { "student.department": department } }]
			: []),
		{
			$match: {
				$or: [
					{ admissionNo: searchRegex },
					{ "student.firstName": searchRegex },
					{ "student.lastName": searchRegex },
					{ "student.email": searchRegex },
				],
			},
		},
		{ $limit: 20 },
	];

	const students = await StudentProfile.aggregate(pipeline);

	if (!students || students.length === 0) {
		throw new ApiError(404, "No student found matching that query");
	}

	// Return array so frontend can display multiple results
	res.status(200).json(new ApiResponse(200, students, "Students fetched"));
});
const getGrade = asyncHandler(async (req, res) => {
	const { studentId } = req.body;

	if (!studentId) {
		throw new ApiError(400, "Student ID is required");
	}

	const grades = await Grade.find({ studentId });
	if (!grades) {
		throw new ApiError(404, "Grades not found");
	}
	return res
		.status(200)
		.json(new ApiResponse(200, grades, "Grades fetched successfully"));
});

export {
	creatingStudentProfile,
	createStudentsByUpload,
	login,
	updateStudentProfile,
	logoutUser,
	changeCurrentPassword,
	updateCurrentUser,
	getCurrentUser,
	getUserById,
	creatingCounselorProfile,
	removeStudentFromCollege,
	getStudentByAdmissionNo,
	getGrade,
};
