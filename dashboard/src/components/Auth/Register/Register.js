import React, { useState } from "react";
import "./Register.css";
import BackgroundSlider from "../BackGround/BackgroundSlider";
import Logo from "../../images/Logo.png";
import { InputField } from "./Reuseable/InputField";
import { Divider } from "./Reuseable/Divider";

function Register() {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rePassword: "",
    termsAccepted: false,
  });

  // State for error messages
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    rePassword: "",
    termsAccepted: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.rePassword) {
      newErrors.rePassword = "Please confirm your password.";
    } else if (formData.rePassword !== formData.password) {
      newErrors.rePassword = "Passwords do not match.";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // No errors mean the form is valid
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Replace this with your API call or further processing
    } else {
      console.log("Form validation failed.");
    }
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

            <form onSubmit={handleSubmit}>
              <InputField
                label="Email"
                placeholder="Enter your email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}

              <InputField
                label="Password"
                placeholder="Enter your password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="error">{errors.password}</p>}

              <InputField
                label="Re-enter Password"
                placeholder="Re-Enter your password"
                type="password"
                name="rePassword"
                value={formData.rePassword}
                onChange={handleChange}
              />
              {errors.rePassword && <p className="error">{errors.rePassword}</p>}

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
                {errors.termsAccepted && (
                  <p className="error">{errors.termsAccepted}</p>
                )}
              </div>

              <button type="submit" className="submitButton">
                Create Account
              </button>
            </form>

            <p className="loginLink">Already have an account!</p>

            <Divider />

            <button className="googleButton">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2cc1dc754d520e937b31d70deca1c6b8cddc3618bf9567c3ef8a4f408ab25c9?placeholderIfAbsent=true&apiKey=f523408d85c94fc8913d645c993f4c42"
                alt="Google logo"
                className="googleIcon"
              />
              <span className="googleButtonText">
                Sign up with Google
              </span>
            </button>
          </main>
        </div>
      </div>
    </>
  );
}

export default Register;
