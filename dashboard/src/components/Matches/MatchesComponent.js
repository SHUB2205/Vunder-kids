import React, { useState, useEffect, useContext } from 'react';
import styles from './MatchesComponent.module.css';
import MatchCardPost from './MatchCardPost';
import { MatchContext } from '../../createContext/Match/MatchContext';
import CommentSection from '../Home/Commet/Comment';

const MatchesComponent = () => {
  const sportTypes = ['All', 'Football', 'Tennis','Cricket','Basketball', 'Soccer'];
  const [matchData,setMatcheData] = useState(null);
  const [isCommentOpen,setIsCommentOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    matchType: '1 on 1',
    sportType: 'All',
  });
  const [locationSearch, setLocationSearch] = useState(''); // Track location input
  const {matches} = useContext(MatchContext);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  useEffect(() => {
    window.scrollTo(0, savedScrollPosition);
  }, [isCommentOpen]);

  const filterMatches = (matches) => {
    return matches.filter(match => {
      const matchTypeFilter =
        activeFilters.matchType === '1 on 1' ? !match.isTeamMatch : match.isTeamMatch;

      const sportTypeFilter =
        activeFilters.sportType === 'All' || match.sport.name.toLowerCase() === activeFilters.sportType.toLowerCase();

      const locationFilter =
        locationSearch.trim() === '' || match.location.toLowerCase().includes(locationSearch.toLowerCase());

      return matchTypeFilter && sportTypeFilter && locationFilter;
    });
  };

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const openComment = (match_info) => {
    setSavedScrollPosition(window.scrollY);     
    setMatcheData(match_info);
    setIsCommentOpen(true);
  };

  const closeComment = () => {     
    setIsCommentOpen(false);     
  };

  const filteredMatches = filterMatches(matches);

  return (
    <>
  {isCommentOpen ? <CommentSection onClose={closeComment} matchData={matchData} />  : 
    <section className={styles.matchesSection}>
      <div className={styles.matchesContainer}>
        <h2 className={styles.matchesTitle}>Matches</h2>
        <div className={styles.filterContainer}>
          <div className={styles.fixedFilters}>
            <div className={styles.locationFilter}>
              <img 
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/17bcbe26b1f122f770e5508255920dbf8c86e4bbc9d969ec144cdf0a9f79a293?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" 
                alt="" 
                className={styles.locationIcon} 
              />
              <input
              type="text"
              placeholder="Search by Location"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className={styles.locationText}
            />
            </div>
            <div className={styles.typeFilters}>
              <button 
                className={`${styles.filterButton} ${activeFilters.matchType === '1 on 1' ? styles.activeFilter : ''}`}
                onClick={() => handleFilterChange('matchType', '1 on 1')}
              >
                1 on 1
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilters.matchType === 'Team' ? styles.activeFilter : ''}`}
                onClick={() => handleFilterChange('matchType', 'Team')}
              >
                Team
              </button>
            </div>
          </div>
          <div className={styles.sportTypeFilterWrapper}>
            <div className={styles.sportTypeFilter}>
              {sportTypes.map((sport, index) => (
                <button 
                  key={index} 
                  className={`${styles.filterButton} ${activeFilters.sportType === sport ? styles.activeFilter : ''}`}
                  onClick={() => handleFilterChange('sportType', sport)}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.matchCardContainer}>
          {filteredMatches.length === 0 ? (
            <div>No matches found</div>
          ) : (
            filteredMatches.map(match => (
              <MatchCardPost 
                key={match._id} 
                matchData={match}
                openComment={openComment}
              />
            ))
          )}
        </div>
      </div>
    </section>}
    </>
  );
};

export default MatchesComponent;