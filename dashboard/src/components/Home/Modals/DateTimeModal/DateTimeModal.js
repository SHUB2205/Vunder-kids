import React, { useState } from "react";
import Modal from "../../../Reusable/Modal/Modal";
import FormSection from "../ChallengeModal/FormSection";
import BackIcon from "../../../images/BackIcon.png";
import Calendar from "./Calendar/Calendar";
import TimeModal from './TimeModal/TimeModal'
export default function DateModal({
  monthNames,
  isDateTime,
  currentDate,
  setCurrentDate,
  handleShowDateModal,
  ...props
}) {
  const [toggleTimeModal ,setToggleTimeModal]=useState(false);
  const handleToggleTimeModal=()=>{
    setToggleTimeModal(!toggleTimeModal);
  }
  return (
    <Modal {...props} widthModalContent="36%">
      <img
        src={BackIcon}
        alt="Previous month"
        style={{
          aspectRatio: "1",
          objectFit: "contain",
          objectPosition: "center",
          cursor: "pointer",
          marginRight: "auto",
          position: "relative",
          top: "-28px",
          width: "19px",
        }}

        onClick={ toggleTimeModal===true ? handleToggleTimeModal : handleShowDateModal}
      />
      <FormSection
        label="Choose date & time *"
        icon="🕓"
        inputType="text"
        value={`${currentDate.day} ${monthNames[currentDate.month]} , ${
          currentDate.hours % 12 === 0 ? 12 : currentDate.hours % 12
        }:${
          currentDate.minutes < 10
            ? "0" + currentDate.minutes
            : currentDate.minutes
        } ${currentDate.hours >= 12 ? "PM" : "AM"}`} // Convert to 12-hour format
        placeholder="12 Sep 2:00 PM"
        isDateTime={isDateTime}
      />
      {
        !toggleTimeModal && 
      <Calendar
        monthNames={monthNames}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        handleToggleTimeModal={handleToggleTimeModal}
      />

      }
      {
        toggleTimeModal && (
          <TimeModal
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          handleToggleTimeModal={handleToggleTimeModal}
          handleShowDateModal={handleShowDateModal}
          />
        ) 
      }
    </Modal>
  );
}
