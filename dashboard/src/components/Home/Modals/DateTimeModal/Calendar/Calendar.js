import React, { useState, useMemo, useEffect } from "react";
import styles from "./CalendarModal.module.css";
import FrontIcon from "../../../../images/FrontIcon.png";
import BackIcon from "../../../../images/BackIcon.png";

const getDaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};
export default function Calendar({  monthNames,
    currentDate,
    setCurrentDate,
    handleToggleTimeModal
 }) {
const today = useMemo(() => new Date(), []);
const [activeDay, setActiveDay] = useState(currentDate.day); // Set active day from currentDate
const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

// Set the default time and date when the modal is opened
useEffect(() => {
  setActiveDay(currentDate.day); // Use the day from the passed currentDate
}, [currentDate]);

const handlePrevMonth = () => {
  setCurrentDate((prevState) => ({
    month: prevState.month === 0 ? 11 : prevState.month - 1,
    year: prevState.month === 0 ? prevState.year - 1 : prevState.year,
    day: prevState.day, // Keep the selected day the same
    hours: prevState.hours,
    minutes: prevState.minutes,
  }));
};

const handleNextMonth = () => {
  setCurrentDate((prevState) => ({
    month: prevState.month === 11 ? 0 : prevState.month + 1,
    year: prevState.month === 11 ? prevState.year + 1 : prevState.year,
    day: prevState.day, // Keep the selected day the same
    hours: prevState.hours,
    minutes: prevState.minutes,
  }));
};

const handleDaySelect = (day) => {
  setActiveDay(day);
  setCurrentDate((prevState) => ({
    ...prevState,
    day, // Update the day while keeping the same time
  }));
  handleToggleTimeModal();
};

const monthDays = getDaysInMonth(currentDate.year, currentDate.month);
const firstDayOfMonth = new Date(
  currentDate.year,
  currentDate.month,
  1
).getDay();

const paddedDays = [
  ...Array(firstDayOfMonth).fill(null), // Fill the days before the start of the month
  ...monthDays, // Days of the current month
];

// If the total number of items in paddedDays isn't divisible by 7, pad it until it is
while (paddedDays.length % 7 !== 0) {
  paddedDays.push(null);
}

  return (
    <>
      <section className={styles.calendar}>
        <header className={styles.calendarHeader}>
          <h2 className={styles.calendarTitle}>Calendar</h2>
        </header>

        <div className={styles.monthSelector}>
          <span className={styles.monthYear}>
            {monthNames[currentDate.month]} {currentDate.year}
          </span>
          <div className={styles.navigationIcons}>
            <img
              src={BackIcon}
              alt="Previous month"
              className={styles.navIcon}
              onClick={handlePrevMonth}
            />
            <img
              src={FrontIcon}
              alt="Next month"
              className={styles.navIcon}
              onClick={handleNextMonth}
            />
          </div>
        </div>

        <div className={styles.weekDays}>
          {weekDays.map((day, index) => (
            <span key={index} className={styles.weekDay}>
              {day}
            </span>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {paddedDays.map((day, index) => (
            <button
              key={index}
              className={`${styles.day} ${
                day === activeDay
                  ? styles.activeDay // Highlight the active day with a circle
                  : ""
              } ${
                day === today.getDate() &&
                currentDate.month === today.getMonth() &&
                currentDate.year === today.getFullYear()
                  ? styles.today // Highlight today's date if needed
                  : ""
              }`}
              onClick={() => handleDaySelect(day)}
              disabled={!day}
            >
              {day || ""}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
