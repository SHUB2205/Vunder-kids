import React, { useRef, useState, useEffect, useContext } from "react";
import styles from "./UpcomingMatches.module.css";
import MatchCard from "./MatchCard";
import Calendar from "./Modal/Calendar/Calendar";

// Icons
import moveLeftIcon from "../images/moveLeftIcon.png";
import moveRightIcon from "../images/moveRightIcon.png";
import calendarIcon from "../images/calendarIcon.png";
import TeamIcon1 from "../images/TeamIcon1.png";
import TeamIcon2 from "../images/TeamIcon2.png";
import { MatchContext } from "../../createContext/Match/MatchContext";


// Constants
const SPORTS = ["All Sports", "Football", "Tennis", "Volleyball", "Basketball", "Soccer", "Cricket"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MATCHES_PER_PAGE = 2;

function UpcomingMatches() {
  // State Management
  const [currentDate, setCurrentDate] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [isSportsOverflow, setIsSportsOverflow] = useState(false);
  const [isDatesOverflow, setIsDatesOverflow] = useState(false);
  const [matches=[], setMatches] = useState([]);
  const [matchType, setMatchType] = useState('my');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [days, setDays] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalMatchesCount, setTotalMatchesCount] = useState(0);
  const [calendarSelectedMatches, setCalendarSelectedMatches] = useState([]);

  // Refs
  const sportsListRef = useRef(null);
  const dateSelectorRef = useRef(null);
  const scrollAmount = 100;

  const {fullMatchData = [],fetchMatches} = useContext(MatchContext);
  const fetcherMatch = async () => {await fetchMatches();};

  // Generate Days for Date Selector
  useEffect(() => {
    fetcherMatch();
    const generateDays = () => {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      
      const sevenDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
          day: daysOfWeek[date.getDay()],
          date: date.getDate(),
          fullDate: date
        };
      });

      setDays(sevenDays);
    };

    generateDays();
  }, []);



  // Filter and Process Matches
  useEffect(() => {
    const allMatches = isCalendarVisible
      ? calendarSelectedMatches 
      : (matchType === 'my' ? fullMatchData.myMatches : fullMatchData.friendsMatches);
      
    // Sport Filtering
    let sportFilteredMatches = activeIndex === 0 ? 
      allMatches : 
      allMatches?.filter(match => 
        SPORTS[activeIndex].toLowerCase() === match.sport.name.toLowerCase()
      );

    // Date Filtering if not using calendar selected matches
    if (calendarSelectedMatches?.length === 0) {
      const selectedDate = days[activeDay]?.fullDate;
      sportFilteredMatches = sportFilteredMatches?.filter(match => {
        const matchDate = new Date(match.date);
        return (
          matchDate.getDate() === selectedDate?.getDate() &&
          matchDate.getMonth() === selectedDate.getMonth() &&
          matchDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    // Set total matches count
    setTotalMatchesCount(sportFilteredMatches?.length);

    // Paginate matches
    const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
    const paginatedMatches = sportFilteredMatches?.slice(startIndex, startIndex + MATCHES_PER_PAGE);
    
    setMatches(paginatedMatches);
  }, [matchType, activeIndex, activeDay, fullMatchData, currentPage, calendarSelectedMatches]);

  // Calendar Date Selection Handler
  const handleCalendarDateSelect = (selectedMatches) => {
    setCalendarSelectedMatches(selectedMatches);
    setCurrentPage(1);
    setActiveIndex(0); 
  };

  // Pagination Handlers
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalMatchesCount / MATCHES_PER_PAGE)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Scrolling and Overflow Handlers
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

  // Overflow and Resize Listeners
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

  // Calendar Toggle
  const toggleCalendar = () => {
    setIsCalendarVisible((prev) => !prev);
    // Reset calendar selected matches when closing calendar
    if (isCalendarVisible) {
      setCalendarSelectedMatches([]);
    }
  };

  // Render Match Cards
  const renderMatchCards = () => {
    if (matches.length === 0) return <div className={styles.noMatches}>No matches found</div>;

    return (
      <div>
        {matches.map((match, index) => (
          <React.Fragment key={match._id}>
            <MatchCard
              type={match.isTeamMatch ? "Team" : "1 on 1"}
              location={match.location}
              team1={{ 
                name: match.isTeamMatch ? match.teams[0].team.name : match.players[0].userName, 
                logo: match.isTeamMatch ? TeamIcon1 : match.players[0].avatar 
              }}
              team2={{ 
                name: match.isTeamMatch ? match.teams[1].team.name : match.players[1].userName, 
                logo: match.isTeamMatch ? TeamIcon2 : match.players[1].avatar 
              }}
              date={new Date(match.date).toLocaleString()}
              matchType={matchType}
            />
            {index < matches.length - 1 && <hr className={styles.divider} />}
          </React.Fragment>
        ))}
        
        {/* Pagination Controls */}
        {totalMatchesCount > MATCHES_PER_PAGE && (
          <div className={styles.paginationControls}>
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {Math.ceil(totalMatchesCount / MATCHES_PER_PAGE)}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === Math.ceil(totalMatchesCount / MATCHES_PER_PAGE)}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className={`${styles.upcomingMatches}`}>
      <h2 className={styles.sectionTitle}>Upcoming Matches</h2>
      
      {/* Match Type Toggle */}
      <div className={`${styles.matchesToggle} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
        <button
          className={matchType === "my" ? styles.activeToggle : styles.inactiveToggle}
          onClick={() => {
            setMatchType("my");
            setCalendarSelectedMatches([]); // Reset calendar selected matches
          }}
        >
          My Matches
        </button>
        <button
          className={matchType === "friends" ? styles.activeToggle : styles.inactiveToggle}
          onClick={() => {
            setMatchType("friends");
            setCalendarSelectedMatches([]); // Reset calendar selected matches
          }}
        >
          Friends Matches
        </button>
      </div>

      {/* Date Selector */}
      {!isCalendarVisible && <div className={`${styles.dateSelectorWrapper} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
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
          {days.map((dayObj, index) => (
            <button
              key={index}
              className={index === activeDay ? styles.activeDate : styles.inactiveDate}
              onClick={() =>{
                setCurrentPage(1);
                setActiveDay(index);
                setCalendarSelectedMatches([]); // Reset calendar selected matches
              }}
            >
              <span>{dayObj.day}</span>
              <span>{String(dayObj.date).padStart(2, "0")}</span>
            </button>
          ))}
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
      </div>}

      {isCalendarVisible && (
        <div className={`${styles.calendarContainer} ${styles.animateDown}`}>
          <Calendar
            monthNames={MONTH_NAMES}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            handleCloseModal={toggleCalendar}
            fullMatchData={fullMatchData}
            activeMatchType={matchType}
            onDateSelect={handleCalendarDateSelect}
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
          {SPORTS.map((sport, index) => (
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

      {/* Match Cards */}
      <div className={`${styles.matchCards} ${isCalendarVisible ? styles.animateDown : styles.animateUp}`}>
        {renderMatchCards()}
      </div>
    </section>
  );
}

export default UpcomingMatches;