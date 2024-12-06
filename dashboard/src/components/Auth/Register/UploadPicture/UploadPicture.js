import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import "./UploadPicture.css";
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import UploadImage from '../../../images/UploadImage.png';
import BackIcon from "../../../images/BackIcon.png"; // Your back icon
import { toast, ToastContainer } from "react-toastify"; // For toast notifications

function UploadPicture() {
  const Backend_URL = process.env.REACT_APP_BACKEND_URL;
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(UploadImage);
  const [loading, setLoading] = useState(false); // To manage loading state during upload
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

  // Handle the image upload to Cloudinary and send the URL to the backend
  const uploadPicture = async () => {
    try {
      setLoading(true); // Set loading to true while the image is being uploaded

      // Prepare the image for uploading (assuming you need to upload to a server)
      const file = fileInputRef.current.files[0];
      if (!file) {
        toast.error("Please select an image before submitting.");
        setLoading(false);
        return;
      }

      // Upload the file to Cloudinary using a pre-signed URL or Cloudinary API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Vunder-Kids"); // Replace with your upload preset

      // Upload image to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dmvs9syar/image/upload`, // Correct URL
        {
          method: "POST",
          body: formData,
        }
      );
      const cloudinaryData = await cloudinaryResponse.json();
      
      // console.log('Cloudinary Response:', cloudinaryData);
      // console.log( cloudinaryData.secure_url);
      if (cloudinaryResponse.ok) {
        // Cloudinary upload successful
        const imageUrl = cloudinaryData.secure_url;

        // Send the image URL to your backend (to save it to the user's profile)
        const response = await fetch(`${Backend_URL}/api/saveProfilePicture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token:sessionStorage.getItem("token")
          },
          body: JSON.stringify({ imageUrl }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("Profile picture uploaded and saved successfully.");
          navigate("/"); // Navigate to success page or next step
        } else {
          toast.error(data.message || "Failed to save image URL.");
        }
      } else {
        toast.error(cloudinaryData.message || "Cloudinary upload failed.");
      }
    } catch (error) {
      toast.error("An error occurred while uploading the picture.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    uploadPicture(); // Call uploadPicture when the form is submitted
  };

  // Handle "Skip" button click
  const handleSkipClick = () => {
    navigate("/register/success"); // Skip and navigate to success page or next step
    navigate("/");
    window.location.reload();
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

            <form onSubmit={handleSubmit}>
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
              <button type="submit" className="submitButton" disabled={loading}>
                {loading ? "Uploading..." : "Done"}
              </button>
              <button disabled={loading} type="button" className="Skip" onClick={handleSkipClick}>
                Skip!
              </button>
            </form>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default UploadPicture;
