import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import "./UploadPicture.css";
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import UploadImage from '../../../images/UploadImage.png';
import BackIcon from "../../../images/BackIcon.png"; // Your back icon

function UploadPicture() {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(UploadImage);
  const navigate = useNavigate(); // Use React Router's navigate hook

  const handleImageClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result); // Update the profile image preview
      };
      reader.readAsDataURL(file); // Convert file to a base64 string
    }
  };

  // Back button functionality
  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <>
      <div className="header">
        <img src={Logo} alt="Fisko" className="Logo" />
      </div>
      <div className="uploadPicture-page">
        <BackgroundSlider />
        <div className="uploadPicture-box">
        {/* Back Icon */}
        <img
          src={BackIcon}
          alt="Back"
          className="backIcon"
          onClick={handleBackClick}
        />
          <main className="uploadPictureContainer">
            <header className="headerSection">
              <h1 className="title">Add Your Personality</h1>
              <h2 className="subtitle">Upload a picture of yourself</h2>
            </header>

            <form>
              {/* Profile Image */}
              <img
                src={profileImage}
                className="profileImage"
                alt="Profile preview"
                onClick={handleImageClick} // Open file input on image click
              />
              {/* Hidden File Input */}
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                className="visually-hidden"
                ref={fileInputRef} // Use ref for triggering
                onChange={handleFileChange} // Handle file selection
              />
              <button type="submit" className="submitButton">
                Done
              </button>
              <button className="Skip">Skip!</button>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}

export default UploadPicture;
