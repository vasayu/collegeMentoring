import express from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submitFeedbackResponse,
  getAllResponses,
  getSingleResponse,
  getMentorResponses,
  getStudentSubjects,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// Admin routes (questions management)
router.get("/questions", verifyJWT, authorizeRoles(0,2,4), getAllQuestions);
router.post("/questions", verifyJWT, authorizeRoles(2,4), addQuestion);
router.put("/questions/:questionId", verifyJWT, authorizeRoles(2,4), updateQuestion);
router.delete("/questions/:questionId", verifyJWT, authorizeRoles(2,4), deleteQuestion);

// Student routes
router.get("/my-subjects", verifyJWT, authorizeRoles(0), getStudentSubjects);
router.post("/submit", verifyJWT, authorizeRoles(0), submitFeedbackResponse);

// Admin only
router.get("/responses", verifyJWT, authorizeRoles(2,4), getAllResponses);
router.get("/responses/:mentorId", verifyJWT, authorizeRoles(2,4), getMentorResponses);
router.get("/responses/:responseId", verifyJWT, authorizeRoles(2,4), getSingleResponse);



export default router;
