import React, { useState } from "react";
import styles from "./ChallengeModal.module.css";
import FormSection from "./FormSection";
import Modal from "../../../Reusable/Modal/Modal";
import Header from "../Header/Header";
import DateTimeModal from "../DateTimeModal/DateTimeModal";

const ChallengeModal = (props) => {
  const [caption, setCaption] = useState("");
  const [matchType, setMatchType] = useState("1on1");
  const [sport, setSport] = useState("");
  const [opponent, setOpponent] = useState("");
  const [selectedDate, setSelectedDate] = useState({
    day: new Date().getDate(), // Day of the month
    monthName: new Date().toLocaleString("default", { month: "short" }), // Short month name
    year: new Date().getFullYear(), // Year
    hours: new Date().getHours(), // Current hour
    minutes: new Date().getMinutes(), // Cuprops.oncloserrent minutes
    month: new Date().getMonth(),
  });
  const [venue, setVenue] = useState("");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState("");
  const isDateTime=true;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formFields1on1 = [
    {
      label: "Choose sport *",
      icon: "🏀",
      inputType: "text",
      placeholder: "Tennis",
      value: sport,
      onChange: (e) => setSport(e.target.value),
    },
    {
      label: "Choose opponent",
      icon: "👤",
      inputType: "text",
      placeholder: "@john",
      value: opponent,
      onChange: (e) => setOpponent(e.target.value),
    },
    {
      label: "Choose date & time *",
      icon: "🕓",
      inputType: "text",
      value: `${selectedDate.day} ${monthNames[selectedDate.month]} , ${
        selectedDate.hours % 12 === 0 ? 12 : selectedDate.hours % 12
      }:${
        selectedDate.minutes < 10 ? "0" + selectedDate.minutes : selectedDate.minutes
      } ${selectedDate.hours >= 12 ? "PM" : "AM"}`, // Convert to 12-hour format
      placeholder: "12 Sep 2:00 PM",
      onClick: () => {
        props.handleShowDateModal();
      },
      readOnly: isDateTime,
    }
    ,
    {
      label: "Choose venue *",
      icon: "📍",
      inputType: "text",
      placeholder: "AB Stadium, Downton, USA",
      value: venue,
      onChange: (e) => setVenue(e.target.value),
    },
  ];

  const leftColumnFields = [
    {
      label: "Choose sport *",
      icon: "🏀",
      inputType: "text",
      placeholder: "Tennis",
      value: sport,
      onChange: (e) => setSport(e.target.value),
    },
    {
      label: "Choose date & time *",
      icon: "🕓",
      inputType: "text",
      value: `${selectedDate.day} ${monthNames[selectedDate.month]} , ${
        selectedDate.hours % 12 === 0 ? 12 : selectedDate.hours % 12
      }:${
        selectedDate.minutes < 10 ? "0" + selectedDate.minutes : selectedDate.minutes
      } ${selectedDate.hours >= 12 ? "PM" : "AM"}`, // Convert to 12-hour format
      placeholder: "12 Sep 2:00 PM",
      onClick: () => {
        props.handleShowDateModal();
      },
      readOnly: isDateTime,
    },
    {
      label: "Choose venue *",
      icon: "📍",
      inputType: "text",
      placeholder: "AB Stadium, Downton, USA",
      value: venue,
      onChange: (e) => setVenue(e.target.value),
    },
  ];

  const rightColumnFields = [
    {
      label: "Choose team name *",
      icon: "📋",
      inputType: "text",
      placeholder: "Fisko FC",
      value: teamName,
      onChange: (e) => setTeamName(e.target.value),
    },
    {
      label: "Choose my players *",
      icon: "👥",
      inputType: "text",
      placeholder: "@john, @batista, @alex",
      value: players,
      onChange: (e) => setPlayers(e.target.value),
    },
    {
      label: "Choose opponent *",
      icon: "👥",
      inputType: "text",
      placeholder: "@john",
      value: opponent,
      onChange: (e) => setOpponent(e.target.value),
    },
  ];

  const handleMatchTypeChange = (type) => {
    setTimeout(() => {
      setMatchType(type);
    }, 100);
  };

  return (
    <>
      {/* For 1on1 match modal */}
      {!props.showDateTimeModal && matchType === "1on1" && (
        <Modal {...props}   widthModalContent={styles.modalContentWidth}>
          <Header
            caption={caption}
            setCaption={setCaption}
            matchType={matchType}
            handleMatchTypeChange={handleMatchTypeChange}
          />
          {formFields1on1.map((field, index) => (
            <FormSection
              key={index}
              label={field.label}
              icon={field.icon}
              inputType={field.inputType}
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
              onClick={field.onClick}
              isDateTime={isDateTime}
            />
          ))}
          <div className={styles.submitButtonWrapper}>
            <button className={styles.submitButton}  onClick={()=>props.onClose()}>Send</button>
          </div>
        </Modal>
      )}

      {/* For team match modal */}
      {!props.showDateTimeModal && matchType === "team" && (
        <Modal {...props} widthModalContent={styles.modalContentTeamWidth}>
          <Header
            caption={caption}
            setCaption={setCaption}
            matchType={matchType}
            handleMatchTypeChange={handleMatchTypeChange}
          />
          <div className={styles.formContainer}>
            <div className={styles.formColumn}>
              {leftColumnFields.map((field, index) => (
                <FormSection
                  key={index}
                  label={field.label}
                  icon={field.icon}
                  inputType={field.inputType}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  onClick={field.onClick}
                />
              ))}
            </div>
            <div className={styles.formColumn}>
              {rightColumnFields.map((field, index) => (
                <FormSection
                  key={index}
                  label={field.label}
                  icon={field.icon}
                  inputType={field.inputType}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                />
              ))}
            </div>
          </div>
          <div className={styles.submitButtonWrapper}>
            <button className={styles.submitButton} onClick={()=>props.onClose()}>Send</button>
          </div>
        </Modal>
      )}

      {/* Date Modal */}
      {props.showDateTimeModal && (
        <DateTimeModal
          {...props}
          currentDate={selectedDate}
          setCurrentDate={setSelectedDate}
          isDateTime={isDateTime}
          monthNames={monthNames}
          handleShowDateModal={props.handleShowDateModal}
        />
      )}
    </>
  );
};

export default ChallengeModal;
