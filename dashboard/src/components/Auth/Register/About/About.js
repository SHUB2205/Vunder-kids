import React, { useState } from "react";
import "./About.css";
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import { InputField } from "../Reuseable/InputField";
const Backend_URL = "http://localhost:5000";
function About() {
  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    age: "",
    gender: "",
    location: "",
  });

  const [errors, setErrors] = useState({
    userName: "",
    name: "",
    age: "",
    gender: "",
    location: "",
  });

  const [isUserNameAvailable, setIsUserNameAvailable] = useState(true);
  const [checkingUserName, setCheckingUserName] = useState(false);

  // Handle input changes
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(value);

    // Real-time validation for username availability
    if (name === "userName") {
      setCheckingUserName(true);  // Set flag to true while checking
      const response = await fetch(`${Backend_URL}/api/check-username?userName=${value}`);
      const data = await response.json();
      setIsUserNameAvailable(data.isAvailable);
      setCheckingUserName(false); // Set flag to false after checking
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required.";
    } else if (!isUserNameAvailable) {
      newErrors.userName = "Username is already taken.";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.age) {
      newErrors.age = "Age is required.";
    } else if (formData.age < 18 || formData.age > 100) {
      newErrors.age = "Age must be between 18 and 100.";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender selection is required.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted successfully:", formData);
      // Submit form logic (e.g., API call to create account)
    } else {
      console.log("Form validation failed.");
    }
  };

  return (
    <>
      <div className="header">
        <img src={Logo} alt="Fisko" className="Logo" />
      </div>
      <div className="about-page">
        <BackgroundSlider />
        <div className="about-box">
          <main className="aboutContainer">
            <header className="headerSection">
              <h1 className="title">Tell Us About Yourself</h1>
              <h2 className="subtitle">Complete your profile to get started</h2>
            </header>

            <form onSubmit={handleSubmit}>
              {/* Username Input */}
              <InputField
                label="Username"
                placeholder="Enter your username"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
              />
              {errors.userName && <p className="error">{errors.userName}</p>}
              {!isUserNameAvailable && !checkingUserName && (
                <p className="error">Username is already taken.</p>
              )}
              
              {/* Full Name Input */}
              <InputField
                label="Full Name"
                placeholder="Enter your name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="error">{errors.name}</p>}

              {/* Age Input */}
              <InputField
                label="Age"
                placeholder="Enter your age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
              {errors.age && <p className="error">{errors.age}</p>}

              {/* Gender Dropdown */}
              <div className="inputGroup">
                <label htmlFor="gender" className="inputLabel">
                  Gender
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="inputField"
                >
                  <option value="" disabled>
                    Select your gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="error">{errors.gender}</p>}
              </div>

              {/* Location Input */}
              <InputField
                label="Location"
                placeholder="Enter your location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
              {errors.location && <p className="error">{errors.location}</p>}

              {/* Submit Button */}
              <button type="submit" className="submitButton">
                Create Account
              </button>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}

export default About;
