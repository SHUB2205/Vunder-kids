import React, { useState } from "react";
import RegisterContext from "./RegisterContext";

const Backend_URL = "http://localhost:5000"; // Replace with actual backend URL

export default function RegisterStates({ children }) {
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState(null);

  // In your registerUser function
  const registerUser = async (formData) => {
    setLoading(true);
    try {
      const registerResponse = await fetch(`${Backend_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const registeredUser = await registerResponse.json();
    //   console.log("User registered:", registeredUser);

      // Send verification email
      const verifyResponse = await fetch(
        `${Backend_URL}/api/send-verification-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: registeredUser._id }),
        }
      );
        // console.log(verifyResponse);
      if (!verifyResponse.ok) {
        const verifyErrorData = await verifyResponse.json();
        throw new Error(
          verifyErrorData.error || "Failed to send verification email"
        );
      }

    //   console.log(registerResponse);
      setLoading(false);

      return {
        success: true,
        message: "Registration successful! Verification email sent.",
        token: registeredUser.token,
      };
    } catch (err) {
      console.error(
        "Error during registration or verification email:",
        err.message
      );
      return {
        success: false,
        message: err.message || "Something went wrong.",
      };
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = () => {
    setLoading(true);
    const interval = setInterval(async () => {
      try {
        const token = sessionStorage.getItem("token"); 
        const response = await fetch(`${Backend_URL}/api/check-verification`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch verification status");
        }

        const data = await response.json();
        // console.log(data);
        if (data.isVerified) {
          setIsVerified(true);
          clearInterval(interval); // Stop polling
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setLoading(false);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup when polling stops
  };
  return (
    <RegisterContext.Provider value={{ registerUser, loading, error,checkVerification,isVerified }}>
      {children}
    </RegisterContext.Provider>
  );
}
