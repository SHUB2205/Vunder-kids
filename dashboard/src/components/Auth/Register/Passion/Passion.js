import React, { useState } from "react";
import "./Passion.css";
import { useNavigate } from "react-router-dom"; // Import for navigation
import BackgroundSlider from "../../BackGround/BackgroundSlider";
import Logo from "../../../images/Logo.png";
import sportsList from "./SportsList";
import  SportCard from "./SportsCard";
import SkillLevelTrack from "./SkillLevelTrack";
import BackIcon from "../../../images/BackIcon.png"; // Your back icon

function Passion() {
  const navigate = useNavigate(); // Use React Router's navigate hook

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
              type="submit"
              className="submitButton"
              onClick={() => console.log("Selected Sports:", selectedSports)}
            >
              Let's Go
            </button>
            <button className="Skip">
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
    </>
  );
}

export default Passion;
