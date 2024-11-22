import React from "react";
import BackgroundSlider from "../BackGround/BackgroundSlider";
import "./Login.css";
import Logo from "../../images/Logo.png";
export default function Login() {
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

            <form>
              <div className="formGroup">
                <label htmlFor="email" className="inputLabel">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="formInput"
                  placeholder="Enter your email"
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
                  required
                />
              </div>

              <div className="rememberMe">
                <input
                  type="checkbox"
                  id="remember"
                  className="checkbox"
                />
                <label htmlFor="remember">Remember me?</label>
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

            <button className="signUpButton">Sign up</button>
          </main>

      </div>
    </div>
    </>
  );
}
