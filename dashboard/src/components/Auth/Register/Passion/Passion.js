import React, { useState,useContext ,useEffect} from "react";
import "./Passion.css";
import { useNavigate } from "react-router-dom"; // Import for navigation
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import sportsList from "./SportsList";
import SportCard from "./SportsCard";
import SkillLevelTrack from "./SkillLevelTrack";
import BackIcon from "../../../images/BackIcon.png"; // Your back icon
import { toast, ToastContainer } from "react-toastify"; // Import toast
import RegisterContext from "../../../../createContext/Register/RegisterContext";// Import the context

function Passion() {
  const navigate = useNavigate(); // Use React Router's navigate hook
  const { setPassionData, loading } = useContext(RegisterContext); // Access the context to set passion data
  const [selectedSports, setSelectedSports] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    currentSport: null,
  });

  const handleSportClick = (sport) => {
    console.log("Clicked Sport:", sport);
    if (selectedSports[sport.name]) {
      // Deselect the sport if already selected
      const updatedSports = { ...selectedSports };
      delete updatedSports[sport.name];
      setSelectedSports(updatedSports);
    } else {
      // Select the sport and open the modal for skill level
      setModalState({ isOpen: true, currentSport: sport });
    }
  };

  // Handle skill level selection
  const handleSkillLevelSelect = (skillLevel) => {
    console.log("Selected Skill Level:", skillLevel);
    const sport = modalState.currentSport;
    setSelectedSports((prev) => ({
      ...prev,
      [sport.name]: skillLevel,
    }));
    setModalState({ isOpen: false, currentSport: null });
  };

  // Close modal without selecting skill level
  const handleCloseModal = () => {
    console.log("Closing Modal");
    setModalState({ isOpen: false, currentSport: null });
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handle "Let's Go" button click
  const handleNextClick = async() => {
    if (Object.keys(selectedSports).length === 0) {
      toast.error("Please select at least one sport!");
    } else {
      try {
        // Simulate a form submission or API call here
        // If you want to send data to the server, you can use fetch/axios
        const response = await  setPassionData(selectedSports); // Replace with actual API call
  
        if (response.success) {
          // On success, navigate to the upload picture page
          navigate("/register/uploadPicture");
        } else {
          // If the response indicates an error, show an error toast
          toast.error(response.message || "Something went wrong.");
        }
      } catch (err) {
        // Catch any errors that occurred during the request
        toast.error("An error occurred while submitting the data.");
      }
      setPassionData(selectedSports);
    }
  };

  // Handle "Skip" button click
  const handleSkipClick = () => {
    // Skip means navigating directly to Upload Picture
    navigate("/register/uploadPicture");
  };
  useEffect(() => {
    const savedPassionData = sessionStorage.getItem("passionData");
    if (savedPassionData) {
      setSelectedSports(JSON.parse(savedPassionData)); // Restore saved data
    }
  }, []);
  return (
    <>
      <div className="header">
        <img src={Logo} alt="Fisko" className="Logo" />
      </div>
      <div className="passion-page">
        <BackgroundSlider />
        <div className="passion-box">
          <main className="passionContainer">
            <header className="headerSection">
              <h1 className="title">Choose Your Passion</h1>
              <h2 className="subtitle">
                Select the area you're most interested in
              </h2>
            </header>
            <img
              src={BackIcon}
              alt="Back"
              className="backIcon"
              onClick={handleBackClick}
            />
            <main className="container">
              {sportsList.map((sport) => (
                <SportCard
                  key={sport.name}
                  name={sport.name}
                  followers={sport.followers}
                  imageUrl={sport.imageUrl}
                  isActive={!!selectedSports[sport.name]}
                  onClick={() => handleSportClick(sport)} // Pass the handler correctly
                />
              ))}
            </main>
            <button
              type="button"
              className="submitButton"
              onClick={handleNextClick} // Call handleNextClick when clicking "Let's Go"
            >
              Let's Go
            </button>
            <button
              type="button"
              className="Skip"
              onClick={handleSkipClick} // Call handleSkipClick when clicking "Skip"
            >
              Skip!
            </button>
          </main>
        </div>
      </div>
      {modalState.isOpen && (
        <SkillLevelTrack
          sport={modalState.currentSport}
          onSkillLevelSelect={handleSkillLevelSelect}
          onClose={handleCloseModal}
        />
      )}
      <ToastContainer />
    </>
  );
}

export default Passion;
