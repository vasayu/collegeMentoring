import { Navigate, useLocation } from "react-router-dom";
import React from "react";

// Define the types for the props
interface PrivateRouteProps {
  children: React.ReactNode; // Explicitly typing the children
}

const PrivateRoute: React.FC<PrivateRouteProps> = ( { children } ) => {
  const location = useLocation();
  const storedUserData = localStorage.getItem( "userData" );

  return storedUserData ? (
    <>{ children }</>
  ) : (
    <Navigate to="/login" replace state={ { from: location } } />
  );
};

export default PrivateRoute;
