// src/components/ProtectedRoute.tsx
import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
  allowedRoles?: number[]; // Optional role filter
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const data = localStorage.getItem("userData");

  if (!data) {
    return <Navigate to="/signin" replace />;
  }

  let user: any;
  try {
    user = JSON.parse(data);
  } catch (err) {
    console.error("Invalid userData in localStorage", err);
    return <Navigate to="/signin" replace />;
  }

  // Normalize role - handle both populated objects and plain IDs
  let role: number | null = null;

  // Try top-level role first (most reliable)
  if (typeof user.role === 'number') {
    role = user.role;
  } else if (user.adminId && typeof user.adminId === 'object' && typeof user.adminId.role === 'number') {
    role = user.adminId.role;
  } else if (user.teacherId && typeof user.teacherId === 'object' && typeof user.teacherId.role === 'number') {
    role = user.teacherId.role;
  } else if (user.studentId && typeof user.studentId === 'object' && typeof user.studentId.role === 'number') {
    role = user.studentId.role;
  } else if (user.counselorId) {
    role = 3; // Counselors
  }

  if (role === null) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorised" replace />;
  }

  return children;
};

export default ProtectedRoute;
