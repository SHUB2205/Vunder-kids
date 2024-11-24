import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundSlider from "../BackGround/BackgroundSlider";
import "./Login.css";
import Logo from "../../images/Logo.png";

export default function Login() {
  const navigate = useNavigate(); // Hook for navigation

  // Local state for storing user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle login form submission
  const handleLogin = (e) => {
    e.preventDefault();

    // Check for valid login (mocked for now)
    if (email === "user@example.com" && password === "password123") {
      // Store the token in session storage (mock login)
      sessionStorage.setItem("token", "your-token");

      // Redirect to the home page
      navigate("/");
    } else {
      alert("Invalid email or password");
    }
  };

  // Handle redirect to the register page
  const handleSignUp = () => {
    navigate("/register");
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

            <button className="googleButton">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/60ffd75222757a2a1417f29bb890ca0f536e63ca84f0686f11de1db6ad1a132d?placeholderIfAbsent=true&apiKey=621a9be51e55481592185121250bd32e"
                alt="Google logo"
                className="googleIcon"
              />
              <span>Sign in with Google</span>
            </button>

            {/* Sign up button - corrected */}
            <button
              className="signUpButton"
              onClick={handleSignUp} // Make sure this is triggering the function
            >
              Sign up
            </button>
          </main>
        </div>
      </div>
    </>
  );
}
