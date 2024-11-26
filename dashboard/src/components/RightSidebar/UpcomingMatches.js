import React, { useRef, useState, useEffect } from "react";
import MatchCard from "./MatchCard";
import Calendar from "./Modal/Calendar/Calendar";
import styles from "./UpcomingMatches.module.css";
import moveLeftIcon from "../images/moveLeftIcon.png";
import moveRightIcon from "../images/moveRightIcon.png";
import calendarIcon from "../images/calendarIcon.png";
import TeamIcon1 from "../images/TeamIcon1.png";
import TeamIcon2 from "../images/TeamIcon2.png";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const sports = ["Football", "Tennis", "Volleyball", "Basketball", "Soccer", "Cricket"];
const monthName = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function UpcomingMatches() {
  const [currentDate, setCurrentDate] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [activeMatches, setActiveMatches] = useState(true);
  const [isSportsOverflow, setIsSportsOverflow] = useState(false);
  const [isDatesOverflow, setIsDatesOverflow] = useState(false);

  const sportsListRef = useRef(null);
  const dateSelectorRef = useRef(null);
  const scrollAmount = 100;

  // Animation state
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const toggleCalendar = () => {
    setIsCalendarVisible((prev) => !prev);
  };

  const scrollLeft = (ref) => {
    ref.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRight = (ref) => {
    ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const checkOverflow = (ref, setOverflow) => {
    if (ref.current && ref.current.scrollWidth > ref.current.clientWidth) {
      setOverflow(true);
    } else {
      setOverflow(false);
    }
  };

  useEffect(() => {
    checkOverflow(sportsListRef, setIsSportsOverflow);
    checkOverflow(dateSelectorRef, setIsDatesOverflow);

    const handleResize = () => {
      checkOverflow(sportsListRef, setIsSportsOverflow);
      checkOverflow(dateSelectorRef, setIsDatesOverflow);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <section className={`${styles.upcomingMatches}`}>
        <h2 className={styles.sectionTitle}>Upcoming Matches</h2>
        <div className={`${styles.matchesToggle} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
          <button
            className={activeMatches ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => setActiveMatches(true)}
          >
            My Matches
          </button>
          <button
            className={!activeMatches ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => setActiveMatches(false)}
          >
            Friends Matches
          </button>
        </div>

        {/* Date Selector */}
        <div className={`${styles.dateSelectorWrapper} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
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
                className={index === activeDay ? styles.activeDate : styles.inactiveDate}
                onClick={() => setActiveDay(index)}
              >
                <span>{day}</span>
                <span>{String(index + 7).padStart(2, "0")}</span>
              </button>
            ))}
            {/* Calendar Icon */}
            <img
              className={styles.calendarIcon}
              src={calendarIcon}
              alt="Calendar"
              onClick={toggleCalendar}
              style={{ cursor: "pointer" }}
            />
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
        {isCalendarVisible && (
          <div className={`${styles.calendarContainer} ${styles.animateDown}`} data-aos="fade-in">
            <Calendar
              monthNames={monthName}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              handleCloseModal={toggleCalendar}
            />
          </div>
        )}
        {/* Sports Filter */}
        <div className={`${styles.sportsFilter} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
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
                className={index === activeIndex ? styles.activeSport : styles.inactiveSport}
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

        <div className={`${styles.matchCards} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
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
        </div>

        {/* Calendar Modal */}
 
      </section>
    </>
  );
}

export default UpcomingMatches;
