import React, { useState, useMemo, useEffect } from "react";
import styles from "./Calendar.module.css";
import FrontIcon from "../../../images/FrontIcon.png";
import BackIcon from "../../../images/BackIcon.png";

const getDaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

export default function Calendar({
  monthNames,
  currentDate,
  setCurrentDate,
  handleCloseModal, // Add a function to close the modal
}) {
  const today = useMemo(() => new Date(), []);
  const [activeDay, setActiveDay] = useState(currentDate.day);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  useEffect(() => {
    setActiveDay(currentDate.day);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate((prevState) => ({
      month: prevState.month === 0 ? 11 : prevState.month - 1,
      year: prevState.month === 0 ? prevState.year - 1 : prevState.year,
      day: prevState.day,
      hours: prevState.hours,
      minutes: prevState.minutes,
    }));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevState) => ({
      month: prevState.month === 11 ? 0 : prevState.month + 1,
      year: prevState.month === 11 ? prevState.year + 1 : prevState.year,
      day: prevState.day,
      hours: prevState.hours,
      minutes: prevState.minutes,
    }));
  };

  const handleDaySelect = (day) => {
    setActiveDay(day);
    setCurrentDate((prevState) => ({
      ...prevState,
      day,
    }));
  };

  const monthDays = getDaysInMonth(currentDate.year, currentDate.month);
  const firstDayOfMonth = new Date(currentDate.year, currentDate.month, 1).getDay();

  const paddedDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...monthDays,
  ];

  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }

  return (
    <section className={styles.calendar}>
      {/* Close Button */}
      <div className={styles.HeaderClose}>
        
      <button
        className={styles.closeButton}
        onClick={handleCloseModal} // Call the function to close the modal
        >
        &times;
      </button>
          </div>
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
              day === activeDay ? styles.activeDay : ""
            } ${
              day === today.getDate() &&
              currentDate.month === today.getMonth() &&
              currentDate.year === today.getFullYear()
                ? styles.today
                : ""
            }`}
            onClick={() => day && handleDaySelect(day)}
            disabled={!day}
          >
            {day || ""}
          </button>
        ))}
      </div>
    </section>
  );
}
