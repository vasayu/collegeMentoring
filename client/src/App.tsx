import { Suspense, lazy, useEffect } from "react";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import Class from "./pages/Mentor/Class";
import CounselorDashboard from "./pages/Counselor/counselorDashboard";

import AddMentalAbility from "./pages/Admin/AddMentalAbility";
import AddCounselor from  "./pages/Admin/AddCounselor";
import EditMentor from "./pages/Mentor/EditMentor";
import AddFeedback  from "./pages/Admin/AddFeedback";
import FeedbackResponse from "./pages/Admin/FeedbackResponse"
import MentorDetailsPage from "./pages/Admin/MentorDetails";
import AlertStudents from "./pages/Counselor/AlertStudents";

// Lazy-load pages for smaller initial bundle
const Home = lazy(() => import("./pages/Home"));
const Signin = lazy(() => import("./pages/Signin"));
const CreateStudent = lazy(() => import("./pages/Mentor/CreateStudent"));
const Student = lazy(() => import("./pages/Mentee/Student"));
const Mentor = lazy(() => import("./pages/Mentor/Mentor"));
const CounselorClass = lazy(() => import("./pages/Counselor/CounselorClass"));
const CounselorClasses = lazy(() => import("./pages/Counselor/CounselorClasses"));
const StudentAnalytics = lazy(() => import("./pages/Counselor/StudentAnalytics"));
const StudentDetails = lazy(() => import("./pages/StudentDetails"));

// Lazy load admin pages
const AdminHome = lazy(() => import("./pages/Admin/AdminHome"));
const CreateAdmin = lazy(() => import("./pages/Admin/CreateAdmin"));
const Classes = lazy(() => import("./pages/Admin/Classes"));
const CreateClass = lazy(() => import("./pages/Admin/CreateClass"));
const EditClass = lazy(() => import("./pages/Mentor/components/EditClass"));
const AddMentor = lazy(() => import("./pages/Admin/AddMentor"));
const Settings = lazy(() => import("./pages/Admin/Settings"));
const MentorSettings = lazy(() => import("./pages/Mentor/MentorSettings"));
const StudentSettings = lazy(() => import("./pages/Mentee/StudentSettings"));

//Lazy load auth pages
const ResetPassword  = lazy(() => import("./pages/auth/ResetPasswordEnterEmail"))
const EnterOTP = lazy(() => import("./pages/auth/ResetPasswordEnterOTP"))
const EnterNewPassword = lazy(() => import("./pages/auth/EnterNewPassword"))

// const ResetPasswordEnterOTP = lazy(() => import("./pages/auth/ResetPasswordEnterOTP"))

export default function App() {
  useEffect(() => {
    // regenerate access token
  }, []);

  return (
    <>
      <Toaster />
      <NavBar />
      <div className="w-full min-h-[calc(100vh-12vh-10vh)] bg-gray-200">
        {/* Suspense fallback while lazy pages load */}
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-gray-600">Loading...</div>
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/create-student" element={<CreateStudent />} />

            {/* Auth routes */}
            <Route path="/signin" element={<Signin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/enter-otp" element={<EnterOTP />} />
            <Route path="/enter-new-password" element={<EnterNewPassword />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-admin"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <CreateAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <Classes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/create-class"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <CreateClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-mentor"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <AddMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mentor/:id"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <MentorDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="/class/:id" element={<Class />} />
            <Route path="/class/:id/edit" element={<EditClass />} />
            <Route path="/counselor/alert-students" element={<AlertStudents />} />
       
            <Route path="/add-mental-ability" element={<AddMentalAbility />} />
            <Route path="/add-counselor" element={<AddCounselor />} />
            <Route path="/add-feedback-questions" element={<AddFeedback/>}/>
   <Route path="/all-feedback-response" element={<FeedbackResponse/>}/>


            {/* Protected: any authenticated user */}
            <Route
              path="/student/:id"
              element={
                <ProtectedRoute allowedRoles={[0, 1, 2, 4]}>
                  <Student />
                </ProtectedRoute>
              }
            />

            {/* Protected: mentor/admin only */}
            <Route
              path="/mentor"
              element={
                <ProtectedRoute allowedRoles={[1, 2, 4]}>
                  <Mentor />
                </ProtectedRoute>
              }
            />

            <Route 
                path="/mentor/:id/edit"
                element={
                    <ProtectedRoute allowedRoles={[1,2 ,4 ]}>
                        <EditMentor />
                    </ProtectedRoute>
                }
            />
            <Route
              path="/mentor/settings"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <MentorSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={[0]}>
                  <StudentSettings />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/mentee/:studentId"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <StudentDetails />
                </ProtectedRoute>
              }
            /> */}
            <Route path="/counselor" element={<CounselorDashboard />} />
            <Route path="/counselor/classes" element={<CounselorClasses />} />
            <Route path="/counselor/class/:id" element={<CounselorClass /> } />
            <Route path="/counselor/student/:id" element={<StudentAnalytics />} />
            {/* Redirect root to dashboard */}
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-[60vh] flex items-center justify-center p-6">
                  <div className="bg-white p-8 rounded shadow text-center">
                    <h2 className="text-2xl font-semibold mb-2">
                      404 — Page not found
                    </h2>
                    <p className="text-gray-600 mb-4">
                      We couldn't find the page you're looking for.
                    </p>
                    <a href="/" className="text-blue-600 hover:underline">
                      Go back home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}

