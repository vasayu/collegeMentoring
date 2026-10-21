// import axios from "axios
import axios from "axios";

// export const Host = 'http://localhost:3000/api';
export const Host= import.meta.env.VITE_HOST_URL;

export const USER_ROUTE = "/users";
export const MENTOR_ROUTE = "/mentors";
export const ADMIN_ROUTE = "/admin";
export const RESPONSE_ROUTE = "/response";
export const FEEDBACK_ROUTE = "/feedback";

// user
export const CREATE_STUDENT_ROUTE = `${USER_ROUTE}/create-student-profile`;
export const LOGIN_ROUTE = `${USER_ROUTE}/login`;
export const LOGOUT_ROUTE = `${USER_ROUTE}/logout`;
export const SEND_OTP = `${USER_ROUTE}/send-otp`;
export const VERIFY_OTP = `${USER_ROUTE}/verify-otp`;
export const CHANGE_PASSWORD_ROUTE = `${USER_ROUTE}/change-password`;
export const UPDATE_ME_ROUTE = `${USER_ROUTE}/update-me`;
export const UPDATE_USER_ROUTE = `${USER_ROUTE}/update-userdetails`;
export const GET_USER_ROUTE = `${USER_ROUTE}/me`;
export const USER_BY_ID = `${USER_ROUTE}/find-user`;

export const CREATE_COUNSELOR_ROUTE = `${USER_ROUTE}/create-counselor-profile`;


//admin
export const CREATE_MENTOR_ROUTE = `${ADMIN_ROUTE}/create-mentor-profile`;
export const CREATE_ADMIN_ROUTE = `${ADMIN_ROUTE}/create-new-admin`;
export const ASSIGN_MENTOR_ROUTE = `${ADMIN_ROUTE}/assign-mentors`;
export const CREATE_CLASS = `${ADMIN_ROUTE}/create-class`;
export const GET_CLASS_BY_ID = `${ADMIN_ROUTE}/class`;
export const UPDATE_CLASS = `${ADMIN_ROUTE}/class/update`;
export const DELETE_CLASS = `${ADMIN_ROUTE}/delete-class`;
export const GET_ALL_MENTORS = `${ADMIN_ROUTE}/get-all-mentors`;
export const GET_ALL_STUDENTS = `${ADMIN_ROUTE}/get-all-students`;
export const GET_ALL_CLASS = `${ADMIN_ROUTE}/get-all-classes`;

// Admin – Counselor
export const GET_ALL_COUNSELORS_ROUTE = `${ADMIN_ROUTE}/get-all-counselors`;
export const GET_ALL_ADMINS = `${ADMIN_ROUTE}/get-all-admins`;
export const GET_ADMIN_BY_ID = `${ADMIN_ROUTE}/get-admin`;
export const UPDATE_ADMIN_BY_ID = `${ADMIN_ROUTE}/update-admin`;
export const DELETE_ADMIN = `${ADMIN_ROUTE}/delete-admin`;

// admin / mental ability
export const QUESTIONS_ROUTE = `${ADMIN_ROUTE}/questions`;         // GET all & POST new
export const QUESTION_BY_ID = `${ADMIN_ROUTE}/questions/:id`;      // PUT / DELETE by id
export const STUDENT_QUESTIONS_ROUTE = `${USER_ROUTE}/questions`;

// mentor
export const ADD_MENTOR_ROUTE = `${MENTOR_ROUTE}/add-mentor`;
export const UPDATE_MENTOR_ROUTE = `${MENTOR_ROUTE}/update`;
export const GET_MENTOR_ID_ROUTE = `${MENTOR_ROUTE}/view`;
export const ASSIGN_CLASS_TO_STUDENT_ROUTE = `${MENTOR_ROUTE}/assign-classToStudent`;
export const ASSIGN_SUBJECT_TO_CLASS_ROUTE = `${MENTOR_ROUTE}/assign-subjectToClass`;
export const GET_STUDENT_PROFILE_ROUTE = `${MENTOR_ROUTE}/student`;
export const GET_MENTOR_PROFILE_ROUTE = `${MENTOR_ROUTE}/mentor-profile`;
export const UPDATE_GRADE_ROUTE = `${MENTOR_ROUTE}/update-grade`;
export const GET_MY_CLASSES_ROUTE = `${MENTOR_ROUTE}/get-my-classes`;
export const GET_STRESS_DISTRIBUTION_ROUTE = (classId: string) => `${MENTOR_ROUTE}/stress-distribution/${classId}`;
export const GET_ALL_STUDENTS_OF_MINE_CLASS_ROUTE = `${MENTOR_ROUTE}/get-class-students`;
//response
export const SUBMIT_SURVEY_ROUTE = `${RESPONSE_ROUTE}/student/responses`;
export const GET_ALL_RESPONSES_ROUTE = `${RESPONSE_ROUTE}/student/responses`;

// GET single Response document by Response _id
export const GET_SINGLE_STUDENT_ROUTE = (responseId: string) =>
  `${RESPONSE_ROUTE}/student/${responseId}`;

// GET chart data using Response _id
export const GET_STUDENT_CHART_ROUTE = (responseId: string) =>
  `${RESPONSE_ROUTE}/student/${responseId}/chart`;


//feedback
export const FEEDBACK_QUESTIONS_ROUTE = `${FEEDBACK_ROUTE}/questions`;         // GET all & POST new
export const FEEDBACK_QUESTION_BY_ID = `${FEEDBACK_ROUTE}/questions/:id`;  //UPDATE and Delete by id
export const GET_STUDENT_SUBJECTS_ROUTE = `${FEEDBACK_ROUTE}/my-subjects`;
export const SUBMIT_FEEDBACK =`${FEEDBACK_ROUTE}/submit`;

export const FEEDBACK_RESPONSES= `${FEEDBACK_ROUTE}/responses`;

export const SINGLE_FEEDBACK_RESPONSES= `${FEEDBACK_ROUTE}/responses/id/:responseId`;

export const apiCLient = axios.create({
  baseURL: Host,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
});

export const apiUploadClient = axios.create({
  baseURL: Host,
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data"
  },
});
