import React, { useState, useContext ,useEffect} from "react";
import "./About.css";
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import { InputField } from "../Reuseable/InputField";
import { toast, ToastContainer } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import Toast container CSS
import RegisterContext from "../../../../createContext/Register/RegisterContext";
import { useNavigate } from "react-router-dom";
const Backend_URL = "http://localhost:5000";

function About() {
  const navigate = useNavigate();
  const { aboutForm, loading } = useContext(RegisterContext);
  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem("formData");
    return savedData ? JSON.parse(savedData) : { userName: "", name: "", age: "", gender: "", location: "" };
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

    // Real-time validation for username availability
    if (name === "userName") {
      setCheckingUserName(true); // Set flag to true while checking

      // Retrieve token from localStorage (or another storage method)
      const token = sessionStorage.getItem("token"); // Change this to the appropriate method if needed

      try {
        const response = await fetch(
          `${Backend_URL}/api/check-username?userName=${value}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token,
            },
          }
        );
        const data = await response.json();
        // console.log(data);
        setIsUserNameAvailable(data.isAvailable);
      } catch (error) {
        toast.error("An error occurred while checking the username.");
      } finally {
        setCheckingUserName(false); // Set flag to false after checking
      }
    }
  };

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;

    // Validation for required fields
    if (!formData.userName.trim()) {
      toast.error("Username is required.");
      isValid = false;
    } else if (!isUserNameAvailable) {
      toast.error("Username is already taken.");
      isValid = false;
    }

    if (!formData.name.trim()) {
      toast.error("Full Name is required.");
      isValid = false;
    }

    if (!formData.location.trim()) {
      toast.error("Location is required.");
      isValid = false;
    }

    // Optional fields validation (Age & Gender)
    if (formData.age && (formData.age < 18 || formData.age > 100)) {
      toast.error("Age must be between 18 and 100.");
      isValid = false;
    }

    if (
      formData.gender &&
      !["male", "female", "other"].includes(formData.gender)
    ) {
      toast.error("Please select a valid gender.");
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await aboutForm(formData);

        if (response.success) {
       
          navigate("/register/passion");
        } else {
          toast.error(response.message || "Something went wrong.");
          return { error: response.message || "Something went wrong." };
        }
      } catch (err) {
        toast.error("An error occurred during registration.");
      }
    } else {
      // toast.error("Form validation failed. Please check your input.");
    }
  };

  // Input fields configuration
  const inputFields = [
    {
      label: "Username",
      name: "userName",
      type: "text",
      placeholder: "Enter your username",
      required: true,
    },
    {
      label: "Full Name",
      name: "name",
      type: "text",
      placeholder: "Enter your name",
      required: true,
    },
    {
      label: "Age (Optional)",
      name: "age",
      type: "number",
      placeholder: "Enter your age",
      required: false,
    },
    {
      label: "Gender (Optional)",
      name: "gender",
      type: "select",
      options: ["male", "female", "other"],
      required: false,
    },
    {
      label: "Location",
      name: "location",
      type: "text",
      placeholder: "Enter your location",
      required: true,
    },
  ];
  useEffect(() => {
    // Save form data in sessionStorage when it changes
    sessionStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);
  return (
    <>
      <div className="Aboutheader">
        <img src={Logo} alt="Fisko" className="Logo" />
      </div>
      <div className="about-page">
        <BackgroundSlider />
        <div className="about-box">
          <main className="aboutContainer">
            <header className="AboutheaderSection">
              <h1 className="title">Tell Us About Yourself</h1>
              <h2 className="subtitle">Complete your profile to get started</h2>
            </header>

            <form onSubmit={handleSubmit} style={{ width: "65%" }}>
              {inputFields.map((field, index) => (
                <div key={index} className="inputGroup">
                  {field.type === "select" ? (
                    <>
                      <label
                        htmlFor={field.name}
                        className="inputLabel"
                        style={{ marginLeft: "0px" }}
                      >
                        {field.label}
                      </label>
                      <select
                        name={field.name}
                        id={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="inputField"
                      >
                        <option value="" disabled>
                          Select your {field.label.toLowerCase()}
                        </option>
                        {field.options.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <InputField
                      label={<span>{field.label}</span>}
                      placeholder={field.placeholder}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                    />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <button type="submit" className="submitButton" disabled={loading}>
                {loading ? "Saving..." : "Save Details"}
              </button>
            </form>
          </main>
        </div>
      </div>

      {/* Toast container for showing success/error messages */}
      <ToastContainer />
    </>
  );
}

export default About;
