import React, { useRef, useState } from "react";
import MatchCard from "./MatchCard";
import styles from "./UpcomingMatches.module.css";
import moveLeftIcon from "../images/moveLeftIcon.png";
import moveRightIcon from "../images/moveRightIcon.png";
import calendarIcon from "../images/calendarIcon.png";
import TeamIcon1 from "../images/TeamIcon1.png"
import TeamIcon2 from "../images/TeamIcon2.png"
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
  // handleSportClick
  const [activeIndex, setActiveIndex] = useState(0); // Active sport state
  const handleSportClick = (index) => {
    setActiveIndex(index);
  };

  // handleDaysClick
  const [activeDay, setActiveDay] = useState(0); // Active day state
  const handleDaysClick = (index) => {
    setActiveDay(index);
  };

  // handleMatchClick
  const [activeMatches, setActiveMatches] = useState(true);
  const handleMatchClick = (value) => {
    setActiveMatches(value);
  };

  // Scroll of the sportlist
  const sportsListRef = useRef(null);
  const scrollAmount = 100;
  const scrollLeft = () => {
    sportsListRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };
  const scrollRight = () => {
    sportsListRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className={styles.upcomingMatches}>
      <h2 className={styles.sectionTitle}>Upcoming Matches</h2>
      <div className={styles.matchesToggle}>
        <button
          className={
            activeMatches === true ? styles.activeToggle : styles.inactiveToggle
          }
          onClick={() => handleMatchClick(true)}
        >
          My Matches
        </button>
        <button
          className={
            activeMatches === false
              ? styles.activeToggle
              : styles.inactiveToggle
          }
          onClick={() => handleMatchClick(false)}
        >
          Friends Matches
        </button>
      </div>
      <div className={styles.dateSelector}>
        {days.map((day, index) => (
          <button
            key={index}
            className={
              index === activeDay ? styles.activeDate : styles.inactiveDate
            }
            onClick={() => handleDaysClick(index)}
          >
            <span>{day}</span>
            <span>{String(index + 7).padStart(2, "0")}</span>
          </button>
        ))}
        <img className="calendarIcon" src={calendarIcon} alt="" />
      </div>
      <div className={styles.sportsFilter}>
        <img
          src={moveLeftIcon}
          alt="Filter"
          className="filterIcon leftArrow"
          style={{ cursor: "pointer" }}
          onClick={scrollLeft}
        />
        <div className={styles.sportsList} ref={sportsListRef}>
          {sports.map((sport, index) => (
            <button
              key={index}
              className={
                index === activeIndex
                  ? styles.activeSport
                  : styles.inactiveSport
              }
              onClick={() => handleSportClick(index)}
            >
              {sport}
            </button>
          ))}
        </div>
        <img
          src={moveRightIcon}
          alt="Filter"
          className="filterIcon rightArrow"
          style={{ cursor: "pointer" }}
          onClick={scrollRight}
        />
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
