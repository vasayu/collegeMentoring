import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(
	cors({
		origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://jss-frontend-rust.vercel.app"],
		credentials: true,
	})
);

// app.use(express.json({ limit: "20kb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import mentorRouter from "./routes/mentor.route.js";
import adminRouter from "./routes/admin.route.js";
import responseRouter from "./routes/response.route.js";
import feedbackRouter from "./routes/feedback.route.js";
import authRouter from "./routes/auth.route.js";

app.use("/api/users", userRouter);
app.use("/api/mentors", mentorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/response", responseRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

export { app };
