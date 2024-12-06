import React, { useState } from "react";
import RegisterContext from "./RegisterContext";

const Backend_URL = process.env.REACT_APP_BACKEND_URL; // Replace with actual backend URL

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

  const aboutForm = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${Backend_URL}/api/aboutUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
            token: sessionStorage.getItem("token")
         },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await response.json();

      setLoading(false);
      return {
        success: true,
        message: "Profile updated successfully.",
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.message || "Something went wrong.",
      };
    }
  };

  const setPassionData=async(data)=>{
    const token = sessionStorage.getItem("token"); // Replace with actual token retrieval method
    setLoading(true);
    try {
      const response = await fetch(`${Backend_URL}/api/submit-sports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ selectedSports: data }),
      });
  
     await response.json();
      setLoading(false);
      return {
        success: true,
        message: "Profile updated successfully.",
      } 
    } catch (error) {
        setLoading(false);
        return {
          success: false,
          message: error.message || "Something went wrong.",
        };
    }
  
  }

  return (
    <RegisterContext.Provider value={{ registerUser, loading, error,checkVerification,isVerified,aboutForm,setPassionData }}>
      {children}
    </RegisterContext.Provider>
  );
}
