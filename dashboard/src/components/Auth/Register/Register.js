import React, { useState, useContext } from "react";
import "./Register.css";
import BackgroundSlider from "../BackGround/BackgroundSlider";
import Logo from "../../images/Logo.png";
import { InputField } from "./Reuseable/InputField";
import { Divider } from "./Reuseable/Divider";
import RegisterContext from "../../../createContext/Register/RegisterContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Backend_URL = process.env.REACT_APP_BACKEND_URL;
function Register() {
  const navigate = useNavigate();
  const { registerUser, loading, error } = useContext(RegisterContext);
  

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rePassword: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    let isValid = true;

    // Email Validation
    if (!formData.email.trim()) {
      toast.error("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Enter a valid email address.");
      isValid = false;
    }

    // Password Validation
    if (!formData.password.trim()) {
      toast.error("Password is required.");
      isValid = false;
    } else if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      isValid = false;
    }

    // Confirm Password Validation
    if (!formData.rePassword.trim()) {
      toast.error("Please confirm your password.");
      isValid = false;
    } else if (formData.rePassword !== formData.password) {
      toast.error("Passwords do not match.");
      isValid = false;
    }

    // Terms and Conditions Validation
    if (!formData.termsAccepted) {
      toast.error("You must accept the terms and conditions.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Clicked");
    if (validateForm()) {
      const { termsAccepted, ...dataToSubmit } = formData;

      try {
        const response = await registerUser(dataToSubmit);
        if (response.success) {
          if (response.token) {
            sessionStorage.setItem("token", response.token);
            console.log("token is saved");
          }
          navigate("/register/waiting");
        } else {
          toast.error(response.message || "Something went wrong.");
          return { error: response.message || "Something went wrong." };
        }
      } catch (err) {
        toast.error("Error submitting form.");
      }
    }
  };

  const loginWithGoogle = () => {
    // Open the Google OAuth URL in a new window
    const oauthWindow = window.open(`${Backend_URL}/api/auth/google`, "_blank", "width=600,height=600");
  
    // Listen for a message from the OAuth window (postMessage)
    window.addEventListener("message", (event) => {
      if (event.origin !== Backend_URL) {
        // Ensure the message is coming from the correct domain
        return;
      }
  
      // Check if the message contains the expected token
      const data = event.data;
      if (data.success) {
        // Store the token in sessionStorage
        sessionStorage.setItem("token", data.token);
  
        // Redirect the user to the appropriate page
        navigate("/register/about");
      } else {
        // Handle authentication failure
        console.log(data.message);
        // Optionally show a message to the user
      }
    });
  };
  
  return (
    <>
      <div className="header">
        <img src={Logo} alt="Fisko" className="Logo" />
      </div>
      <div className="register-page">
        <BackgroundSlider />
        <div className="register-box">
          <main className="registerContainer">
            <header className="headerSection">
              <h1 className="title">Create Your Account</h1>
              <h2 className="subtitle">Join our community today</h2>
            </header>

            <form onSubmit={handleSubmit}   style={{width:"75%"}}>
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              <InputField
                label="Re-enter Password"
                name="rePassword"
                type="password"
                placeholder="Re-Enter your password"
                value={formData.rePassword}
                onChange={handleChange}
              />

              <div className="termsContainer">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  className="checkbox"
                  onChange={handleChange}
                  aria-label="Accept Terms and Conditions"
                />
                <label htmlFor="terms" className="termsLabel">
                  Accept Terms & conditions
                </label>
              </div>

              <button
                type="submit"
                className="submitButton"
                disabled={loading}
              
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="loginLink">Already have an account?</p>
            
            {/* Sign in button */}
            <button
              style={{width:"75%"}}
                  className="submitButton"
              onClick={() => navigate("/login")} // Navigate back to login
              disabled={loading}
            >
              Sign In
            </button>

            <Divider />

            <button className="googleButton" disabled={loading}  onClick={loginWithGoogle}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2cc1dc754d520e937b31d70deca1c6b8cddc3618bf9567c3ef8a4f408ab25c9?placeholderIfAbsent=true&apiKey=f523408d85c94fc8913d645c993f4c42"
                alt="Google logo"
                className="googleIcon"
              />
              <span className="googleButtonText">Sign up with Google</span>
            </button>
          </main>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default Register;
