import React, { useRef, useState, useEffect } from "react";
import MatchCard from "./MatchCard";
import styles from "./UpcomingMatches.module.css";
import moveLeftIcon from "../images/moveLeftIcon.png";
import moveRightIcon from "../images/moveRightIcon.png";
import calendarIcon from "../images/calendarIcon.png";
import TeamIcon1 from "../images/TeamIcon1.png";
import TeamIcon2 from "../images/TeamIcon2.png";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const sports = [
  "Football",
  "Tennis",
  "Volleyball",
  "Basketball",
  "Soccer",
  "Cricket",
];

function UpcomingMatches() {
  // State for active sport and day
  const [activeIndex, setActiveIndex] = useState(0); // Active sport state
  const [activeDay, setActiveDay] = useState(0); // Active day state
  const [activeMatches, setActiveMatches] = useState(true); // Active matches state
  const [isSportsOverflow, setIsSportsOverflow] = useState(false); // Sports overflow state
  const [isDatesOverflow, setIsDatesOverflow] = useState(false); // Dates overflow state

  // Refs for scrolling
  const sportsListRef = useRef(null);
  const dateSelectorRef = useRef(null);
  const scrollAmount = 100;

  // Functions to handle scrolling
  const scrollLeft = (ref) => {
    ref.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Function to detect overflow
  const checkOverflow = (ref, setOverflow) => {
    if (ref.current.scrollWidth > ref.current.clientWidth) {
      setOverflow(true);
    } else {
      setOverflow(false);
    }
  };

  // Check for overflow on mount and on window resize
  useEffect(() => {
    checkOverflow(sportsListRef, setIsSportsOverflow);
    checkOverflow(dateSelectorRef, setIsDatesOverflow);
    window.addEventListener("resize", () => {
      checkOverflow(sportsListRef, setIsSportsOverflow);
      checkOverflow(dateSelectorRef, setIsDatesOverflow);
    });
    return () => {
      window.removeEventListener("resize", () => {
        checkOverflow(sportsListRef, setIsSportsOverflow);
        checkOverflow(dateSelectorRef, setIsDatesOverflow);
      });
    };
  }, []);

  return (
    <section className={styles.upcomingMatches}>
      <h2 className={styles.sectionTitle}>Upcoming Matches</h2>
      <div className={styles.matchesToggle}>
        <button
          className={
            activeMatches === true ? styles.activeToggle : styles.inactiveToggle
          }
          onClick={() => setActiveMatches(true)}
        >
          My Matches
        </button>
        <button
          className={
            activeMatches === false
              ? styles.activeToggle
              : styles.inactiveToggle
          }
          onClick={() => setActiveMatches(false)}
        >
          Friends Matches
        </button>
      </div>

      {/* Date Selector */}
      <div className={styles.dateSelectorWrapper}>
        {isDatesOverflow && (
          <img
            src={moveLeftIcon}
            alt="Scroll Left"
            className="filterIcon leftArrow"
            style={{ cursor: "pointer" }}
            onClick={() => scrollLeft(dateSelectorRef)}
          />
        )}
        <div className={styles.dateSelector} ref={dateSelectorRef}>
          {days.map((day, index) => (
            <button
              key={index}
              className={
                index === activeDay ? styles.activeDate : styles.inactiveDate
              }
              onClick={() => setActiveDay(index)}
            >
              <span>{day}</span>
              <span>{String(index + 7).padStart(2, "0")}</span>
            </button>
          ))}
          <img className={styles.calendarIcon} src={calendarIcon} alt="" />
        </div>
        {isDatesOverflow && (
          <img
            src={moveRightIcon}
            alt="Scroll Right"
            className="filterIcon rightArrow"
            style={{ cursor: "pointer" }}
            onClick={() => scrollRight(dateSelectorRef)}
          />
        )}
      </div>

      {/* Sports Filter */}
      <div className={styles.sportsFilter}>
        {isSportsOverflow && (
          <img
            src={moveLeftIcon}
            alt="Scroll Left"
            className="filterIcon leftArrow"
            style={{ cursor: "pointer" }}
            onClick={() => scrollLeft(sportsListRef)}
          />
        )}
        <div className={styles.sportsList} ref={sportsListRef}>
          {sports.map((sport, index) => (
            <button
              key={index}
              className={
                index === activeIndex
                  ? styles.activeSport
                  : styles.inactiveSport
              }
              onClick={() => setActiveIndex(index)}
            >
              {sport}
            </button>
          ))}
        </div>
        {isSportsOverflow && (
          <img
            src={moveRightIcon}
            alt="Scroll Right"
            className="filterIcon rightArrow"
            style={{ cursor: "pointer" }}
            onClick={() => scrollRight(sportsListRef)}
          />
        )}
      </div>

      <MatchCard
        type="Team"
        location="Jacksonville, TIAA Bank Field"
        team1={{ name: "Hulk hogans", logo: TeamIcon1 }}
        team2={{ name: "Machos", logo: TeamIcon2 }}
        date="Mon, Sep 7, 9:30 AM"
      />
      <hr className={styles.divider} />
      <MatchCard
        type="1 on 1"
        location="Jacksonville, TIAA Bank Field"
        team1={{ name: "James", logo: TeamIcon1 }}
        team2={{ name: "Khadar shaik", logo: TeamIcon2 }}
        date="Mon, Sep 7, 9:30 AM"
      />
    </section>
  );
}

export default UpcomingMatches;
