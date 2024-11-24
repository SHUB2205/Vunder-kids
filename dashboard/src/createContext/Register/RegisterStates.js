import React, { useState } from "react";
import RegisterContext from "./RegisterContext";

const Backend_URL = "http://localhost:5000"; // Replace with actual backend URL

export default function RegisterStates({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
// In your registerUser function
const registerUser = async (formData) => {
    try {
      const response = await fetch(`${Backend_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      // Check if the response is ok (status code between 200 and 299)
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }
  
      // Parse the successful response
      const data = await response.json();
      console.log("User registered:", data);
  
      // Return the response data to the caller (success case)
      return { success: true, message: "Registration successful", data: data };
    } catch (err) {
      console.error("Error during registration:", err.message);
      // Return an error object to be handled by the calling function
      return { success: false, message: err.message || "Something went wrong." };
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RegisterContext.Provider value={{ registerUser, loading, error }}>
      {children}
    </RegisterContext.Provider>
  );
}
