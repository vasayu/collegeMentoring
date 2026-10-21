// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  id: string;
  name: string;
  email: string;
  firstName:string ;
  surName:string;
  phone?: string;
 gender?: "Male" | "Female" | "Other";
  dob?: string;              // ISO Date format (string)
  department: "IT" | "CSE" | "ECE" | "EE" | "EEE" | "MECH" | "CIVIL";
  role: 0 | 1 | 2;           // 0=Student, 1=Mentor, 2=Admin
  designation?: string;
  skill?:string[] ;
  about?:string;
  avatar?:string;
  contact?:string 
  teacherId: string;                 // Referencing the User's ID (Mongo ObjectId as string)
  employeeId: string;                // Unique employee ID like "TCH2025-101"
  specialization?: string[];         // Array of specializations like ["AI", "ML"]
  qualifications?: string[];         // Array of qualifications like ["PhD", "MTech"]
  yearsOfExperience?: number;   
  workExperience?: string;           // A brief description of the teacher's work experience
  classesHandled?: string[];        // Number of years of experience
  address?: string;      
   studentId: string;                  // Referencing the User's ID (Mongo ObjectId as string)
  admissionNo: string;                // Unique student admission number like "23CSEDS11"
  yearOfAdmission?: number;           // Year of admission like 2023
  program?: "BTECH" | "MTECH" | "MSC" | "PHD";  // Program type
  semester?: number;                  // Current semester (1-8)
  hostellite?: "dayScholar" | "BoysHostle";      // Hostel status
  permanentAddress?: string;          // Permanent address of the student
  currentAddress?: string;            // Current address of the student
  bloodGroup?: string;                // Student's blood group
  height?: number;                    // Height in cm
  weight?: number;                    // Weight in kg
  localGuardian?: {
    name: string;
    relation: string;
    phone: string;
    address: string;
  };                                   // Local guardian details
  father?: {
    name: string;
    occupation: string;
    education: string;
    phone: string;
    email: string;
  };                                   // Father's details
  mother?: {
    name: string;
    occupation: string;
    education: string;
    phone: string;
    email: string;
  };                                   // Mother's details
  siblings?: { name: string; relation: string }[];  // List of siblings
  careerGoals?: string;               // Career goals statement
  strengths?: string[];               // List of student's strengths
  achievements?: string[];            // List of achievements
  hobbies?: string[];                 // Hobbies or interests
  subjectsOfInterest?: string[];  
  teachers?: string[];               // Array of teacher IDs under the admin's responsibility
  classes?: string[];    
  
}

interface AuthState {
  status: boolean;
  userData: UserData | null;
}

const storedUser = localStorage.getItem("userData");

const initialState: AuthState = {
  status: false,
  userData: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserData>) => {
      state.status = true;
      state.userData = action.payload;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      localStorage.removeItem("userData");
    },
    
  
  },
});

export const { login, logout,  } = authSlice.actions;
export default authSlice.reducer;
