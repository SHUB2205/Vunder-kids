import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// ProtectedRoute component to protect certain routes
const ProtectedRoute = ({ children }) => {
  // Correctly destructuring useState
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const newToken = localStorage.getItem("token");
    if (newToken) {
      setToken(newToken);
    }
  }, []);

  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/login" />;
  }

  // If token exists, allow the user to access the protected page
  return children;
};

export default ProtectedRoute;
