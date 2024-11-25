import { Navigate } from "react-router-dom";

// ProtectedRoute component to protect certain routes
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/login" />;
  }

  // If token exists, allow the user to access the protected page
  return children;
};

export default ProtectedRoute;
