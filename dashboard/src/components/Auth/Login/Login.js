import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundSlider from "../BackGround/BackgroundSlider";
import "./Login.css";
import Logo from "../../images/Logo.png";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const navigate = useNavigate(); // Hook for navigation

  // Local state for storing user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Backend URL
  const Backend_URL = process.env.REACT_APP_BACKEND_URL;

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Input validation
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required.");
      return;
    }

    // Prepare the request body
    const loginData = {
      email,
      password,
    };

    try {
      // Send a POST request to the backend login endpoint
      const response = await axios.post(`${Backend_URL}/api/login`, loginData);
      console.log(response);
      toast.error(response);

      if (response.data.success) {
        // Store the token in session storage
        sessionStorage.setItem("token", response.data.token);

        // Show success toast
        toast.success("Login successful! Redirecting to the home page.");

        // Redirect to the home page after successful login
        if(!response.data.isVerified){
          toast.success("Please Check Your Email for Verification");
        }
        if(response.data.isVerified){
          console.log(response.data.userName);
          if(!response.data.userName){
            navigate("/register/about");
          }
        }
        navigate("/home");
        window.location.reload();
      } else {
        // Show error toast if login failed
        toast.error(response.data.message || "Invalid email or password.");
      }
    } catch (error) {
      // console.error("Login error:", error);
      // Show error toast in case of network issues or other errors
      toast.error("An error occurred while trying to log in. Please try again."+ error);
    }
  };

  // Handle redirect to the register page
  const handleSignUp = () => {
    navigate("/register");
  };
  const loginWithGoogle = () => {
    // Open the Google OAuth URL in a new window
    console.log("Here");
    const oauthWindow = window.open(`${Backend_URL}/api/auth/google`, "_blank", "width=600,height=600");

    // Listen for a message from the OAuth window (postMessage)
    window.addEventListener("message", (event) => {
        if (event.origin !== Backend_URL) {
            // Ensure the message is coming from the correct domain
            return;
        }

        // Check if the message contains the expected token and the userHasUsername flag
        const data = event.data;
        if (data.success) {
            // Store the token in sessionStorage
            sessionStorage.setItem("token", data.token);

            // If the user has a username, navigate to the home page
            if (data.userHasUsername) {
              console.log(data.userHasUsername)
                navigate("/"); // Redirect to home page
                window.location.reload();
            } else {
                navigate("/register/about"); // Redirect to register/about if username doesn't exist
            }
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

      <div className="login-page">
        <BackgroundSlider />
        <div className="login-box">
          <main className="loginContainer">
            <header className="headerSection">
              <h1 className="title">Welcome Back</h1>
              <h2 className="subtitle">Log in to your account</h2>
            </header>

            <form onSubmit={handleLogin}>
              <div className="formGroup">
                <label htmlFor="email" className="inputLabel">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="formInput"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update email state
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="password" className="inputLabel">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="formInput"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update password state
                  required
                  autoComplete="current-password" // Add autocomplete for password
                />
              </div>

              <div className="rememberMe">
                <input
                  type="checkbox"
                  id="remember"
                  className="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)} // Toggle remember me state
                />
                <label htmlFor="remember" style={{ marginLeft: "10px" }}>
                  Remember me?
                </label>
              </div>

              <button type="submit" className="loginButton">
                Log in
              </button>
            </form>

            <a href="#" className="forgotPassword">
              Forgot password?
            </a>

            <div className="divider">
              <div className="dividerLine" />
              <span>or</span>
              <div className="dividerLine" />
            </div>

            <button className="googleButton"  onClick={loginWithGoogle}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/60ffd75222757a2a1417f29bb890ca0f536e63ca84f0686f11de1db6ad1a132d?placeholderIfAbsent=true&apiKey=621a9be51e55481592185121250bd32e"
                alt="Google logo"
                className="googleIcon"
               
              />
              <span>Sign in with Google</span>
            </button>

            {/* Sign up button */}
            <div onClick={handleSignUp}>
              <button
                type="button" // Ensure it's a button and not a submit button
                className="signUpButton"
              >
                Sign up
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </>
  );
}
