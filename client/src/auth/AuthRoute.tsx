import React from "react";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
  children: React.ReactNode; // Explicitly typing children
}

export const AuthRoute: React.FC<AuthRouteProps> = ( { children } ) => {
  const storedUserData = localStorage.getItem( "userData" );

  return storedUserData ? <Navigate to="/" /> : <>{ children }</>;
};
