import { asyncHandler, ApiError } from "../utils/index.js";
import {
  FeedbackForm,
  FeedbackResponse,
  Section,
  StudentProfile,
} from "../models/models.index.js";
import mongoose from "mongoose";

// ==================== ADMIN CONTROLLERS ==================== //

// Get all questions of the form (Admin)
export const getAllQuestions = asyncHandler(async (req, res) => {
  let form = await FeedbackForm.findOne(); // Only one form
  
  // If no form exists yet, return an empty array instead of 404
  if (!form) {
    return res.status(200).json({ success: true, questions: [] });
  }

  res.status(200).json({ success: true, questions: form.questions });
});

// Add question
export const addQuestion = asyncHandler(async (req, res) => {
  const { heading, questionText, type, options } = req.body;

  if (!questionText || !type)
    throw new ApiError(400, "Question text and type are required");
  
  if (type === "MCQ" && (!options || options.length === 0)) {
    throw new ApiError(400, "MCQ questions must have at least one option");
  }

  let form = await FeedbackForm.findOne();
  
  // If no form exists, create a default one automatically
  if (!form) {
    form = await FeedbackForm.create({
      title: "Student Feedback Form",
      description: "Please provide your feedback regarding the mentorship program.",
      questions: []
    });
  }
  try{
    form.questions.push({
        heading,
        questionText,
        type,
        options: type === "MCQ" ? options : [],
    });
    }catch(err){
        res.status(500).json({ success: false, message: "Error adding question: " + err.message });
    }

  await form.save();
  res.status(200).json({ success: true, questions: form.questions });
});

// Update question
export const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { heading, questionText, type, options } = req.body;

  const form = await FeedbackForm.findOne();
  if (!form) throw new ApiError(404, "Form not found");

  const question = form.questions.id(questionId);
  if (!question) throw new ApiError(404, "Question not found");

  if (heading !== undefined) question.heading = heading;
  if (questionText) question.questionText = questionText;
  if (type) question.type = type;

  try{
    question.options = type === "MCQ" ? options || question.options : [];
  }catch(err){
    res.status(500).json({success:false, message: "Error updating question options: " + err.message});
  }

  await form.save();
  res.status(200).json({ success: true, questions: form.questions });
});
//Delete question

// Delete question from form
export const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  // Since only one form exists
  const form = await FeedbackForm.findOne();
  if (!form) throw new ApiError(404, "Form not found");

  // Find index of question
  const index = form.questions.findIndex(
    (q) => q._id.toString() === questionId
  );
  if (index === -1) throw new ApiError(404, "Question not found");

  // Remove question using splice
  form.questions.splice(index, 1);

  await form.save();

  res.status(200).json({ success: true, questions: form.questions });
});

// ==================== STUDENT CONTROLLERS ==================== //

// Submit feedback response
export const submitFeedbackResponse = asyncHandler(async (req, res) => {
  const { reflections, answers, studentId, subjectCode, subjectName } = req.body;
  console.log(studentId);
  // 1️⃣ Find active feedback form
  const form = await FeedbackForm.findOne();
  if (!form) throw new ApiError(404, "Feedback form not found");

  // 2️⃣ Find section (class) that contains this student
  const section = await Section.findOne({ students: studentId });
  if (!section) throw new ApiError(404, "Student not assigned to any section");

  // 3️⃣ Extract mentorId from the section
  const mentorId = section.mentorId;
  if (!mentorId) throw new ApiError(404, "No mentor assigned for this section");

  // 4️⃣ Create feedback response
  const response = await FeedbackResponse.create({
    formId: form._id,
    studentId,
    mentorId,
    subjectCode,
    subjectName,
    reflections,
    answers,
  });

  // 5️⃣ Send success response
  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully",
    response,
  });
});
// Get all student responses (Admin)
export const getAllResponses = asyncHandler(async (req, res) => {
  const form = await FeedbackForm.findOne();
  if (!form) throw new ApiError(404, "Form not found");

  const responses = await FeedbackResponse.find({ formId: form._id })
    .populate("studentId", "firstName lastName email")
    .populate({
      path: "mentorId", // Assuming the teacher's ID is in the 'mentorId' field
      select:
        "specialization employeeId designation qualifications yearsOfExperience address",
      populate: {
        path: "teacherId",
        select: "firstName lastName email phone department gender",
      },
    });

  // Map answers with question text
  const formattedResponses = responses.map((resp) => {
    const answers = resp.answers.map((ans) => {
      const question = form.questions.id(ans.questionId);
      return {
        questionText: question ? question.questionText : "Question deleted",
        heading: question ? question.heading : undefined,
        answer: ans.answer,
      };
    });

    return {
      student: resp.studentId,
      subjectCode: resp.subjectCode,
      subjectName: resp.subjectName,
      reflections: resp.reflections,
      answers,
    };
  });

  res.status(200).json({ success: true, responses: formattedResponses });
});

// Get all student responses (Admin)
export const getMentorResponses = asyncHandler(async (req, res) => {
  const { mentorId } = req.params;
  const form = await FeedbackForm.findOne();
  if (!form) throw new ApiError(404, "Form not found");

  const responses = await FeedbackResponse.find({
    mentorId: mentorId,
  }).populate({
    path: "studentId", // Assuming the teacher's ID is in the 'mentorId' field
    select: "",
    populate: {
      path: "studentId",
      select: "firstName lastName email phone department gender",
    },
  });
  // .populate("studentId", "_id firstName lastName email")

  // Map answers with question text
  const formattedResponses = responses.map((resp) => ({
    student: resp.studentId, // populated student info
    reflections: resp.reflections,
    answers: resp.answers.map((ans) => {
      const question = form.questions.id(ans.questionId);
      return {
        questionText: question ? question.questionText : "Question deleted",
        heading: question ? question.heading : undefined,
        answer: ans.answer,
      };
    }),
    subjectCode: resp.subjectCode,
    subjectName: resp.subjectName,
    createdAt: resp.createdAt,
    updatedAt: resp.updatedAt,
  }));

  //     return {
  //       student: resp.studentId,
  //       reflections: resp.reflections,
  //       answers
  //     };
  //   });

  res.status(200).json({ success: true, responses: formattedResponses });
});
// get single response
export const getSingleResponse = asyncHandler(async (req, res) => {
  const { studentId, responseId } = req.params;
  const form = await FeedbackForm.findOne();
  if (!form) throw new ApiError(404, "Form not found");

  let response;
  if (responseId) {
    response = await FeedbackResponse.findById(responseId).populate(
      "studentId",
      "firstName lastName email"
    );
  } else if (studentId) {
    response = await FeedbackResponse.findOne({
      studentId,
      formId: form._id,
    }).populate("studentId", "firstName lastName email");
  }

  if (!response) throw new ApiError(404, "Response not found");

  const formattedResponse = {
    student: response.studentId,
    answers: response.answers.map((ans) => {
      const question = form.questions.id(ans.questionId);
      return {
        questionText: question ? question.questionText : "Question deleted",
        heading: question ? question.heading : undefined,
        answer: ans.answer,
      };
    }),
    _id: response._id,
  };

  res.status(200).json({ success: true, response: formattedResponse });
});

// Get subjects for the currently logged-in student
export const getStudentSubjects = asyncHandler(async (req, res) => {
  // Find StudentProfile using req.user._id (User ID)
  const profile = await StudentProfile.findOne({ studentId: req.user._id });
  if (!profile) throw new ApiError(404, "Student profile not found");

  // Find Section containing this student profile
  const section = await Section.findOne({ students: profile._id });
  if (!section) throw new ApiError(404, "Student not assigned to any section");

  res.status(200).json({
    success: true,
    subjects: section.subjects || []
  });
});
