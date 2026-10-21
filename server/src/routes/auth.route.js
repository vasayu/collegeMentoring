import express from "express";
import { sendOtp, verifyOtp, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

//  Public Auth routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
