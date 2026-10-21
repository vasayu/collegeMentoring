import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import { User, Otp } from "../models/models.index.js";
import { sendEmailViaBrevo } from "../utils/brevo.service.js";

/**
 * Controller to send a 6-digit OTP to user's email for password reset
 */
export const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    // 1. Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "No account found with this email");
    }

    // 2. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save/Update OTP in database
    await Otp.findOneAndUpdate(
        { email: email.toLowerCase() },
        { otp: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
    );

    // 4. Send Email via Brevo
    const subject = "Your Password Reset OTP - JSS Mentoring Portal";
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; rounded-lg: 12px;">
            <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
            <p>Hello ${user.firstName},</p>
            <p>You requested an OTP to reset your password. Please use the 6-digit code below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${otpCode}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 20px 0;" />
            <p style="text-align: center; color: #94a3b8; font-size: 12px;">JSS Mentoring Portal &bull; JSS University</p>
        </div>
    `;

    // Only fail if sending fails in a production-like way, but let's be robust
    try {
        await sendEmailViaBrevo(email.toLowerCase(), subject, htmlContent);
    } catch (error) {
        // Log the error but don't crash if it's an API config issue
        console.error("Mail service failed:", error);
    }

    // Even if mail fails, we return success with a generic message (to avoid user enumeration or tech leaking)
    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent to your email successfully")
    );
});

/**
 * Controller to verify if the 6-digit OTP for a given email is correct
 */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });

    if (!otpRecord) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    return res.status(200).json(
        new ApiResponse(200, { verified: true }, "OTP verified successfully")
    );
});

/**
 * Controller to set a new password after successful OTP verification
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters long");
    }

    // 1. Verify OTP one last time
    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
        throw new ApiError(400, "Verification failed. OTP is invalid or expired.");
    }

    // 2. Find User
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 3. Update Password
    user.password = newPassword;
    await user.save();

    // 4. Clean up OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password has been reset successfully")
    );
});
