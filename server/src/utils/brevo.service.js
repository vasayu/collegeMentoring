import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

/**
 * Sends an email using Brevo (Sendinblue) SMTP via Nodemailer
 * Supporting the SMTP key (starting with xsmtpsib-)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML format
 */
export const sendEmailViaBrevo = async (to, subject, htmlContent) => {
	const smtpKey = process.env.BREVO_API_KEY;
	// BREVO_SMTP_LOGIN is found in Brevo Dashboard → SMTP & API → SMTP tab → Login
	const smtpLogin = process.env.BREVO_SMTP_LOGIN;
	const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@jssaten.ac.in";
	const senderName = process.env.BREVO_SENDER_NAME || "JSS Mentoring Portal";

	if (!smtpKey || !smtpLogin) {
		console.warn("BREVO_API_KEY or BREVO_SMTP_LOGIN is missing. Email will not be sent.");
		return null;
	}

	// 1. Create a transporter object
	const transporter = nodemailer.createTransport({
		host: "smtp-relay.brevo.com",
		port: 587,
		secure: false,
		auth: {
			user: smtpLogin, // The SMTP login from Brevo dashboard (NOT the sender email)
			pass: smtpKey,   // The SMTP key starting with xsmtpsib-
		},
	});

	// 2. Define email options
	const mailOptions = {
		from: `"${senderName}" <${senderEmail}>`,
		to: to,
		subject: subject,
		html: htmlContent,
	};

	try {
		// 3. Send the email
		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("Brevo SMTP Error:", error.message);
		throw new ApiError(500, "Failed to send email via Brevo SMTP");
	}
};
