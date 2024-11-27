import React, { useState, useContext, useCallback } from 'react';
import styles from './search.module.css';
import SearchItem from './SearchItem';
import ForYou from './forYou/ForYou';
import People from './People/People';
import SearchIcon1 from '../images/search-1.png';
import SearchIcon2 from '../images/search-2.png';
import SearchIcon3 from '../images/search-3.png';
import SearchIcon4 from '../images/search-4.png';
import SearchIcon5 from '../images/search-5.png';
import SearchIcon6 from '../images/search-6.png';
import BackIcon from "../images/BackIcon.png";
import StayUpdated from '../RightSidebar/StayUpdated';
import { SearchContext } from '../../createContext/Search/SearchContext';
import debounce from 'lodash/debounce';

function Search() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const { searchResults, loading, performSearch, clearSearch } = useContext(SearchContext);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query) {
        performSearch(query);
      } else {
        clearSearch();
      }
    }, 300),
    [performSearch, clearSearch]
  );

  const handleSearchInput = (e) => {
    const query = typeof e === 'string' ? e : e.target.value;
    setSearchQuery(query);
    if (query) {
      setActiveTab("foryou");
      debouncedSearch(query);
    } else {
      setActiveTab("search");
      clearSearch();
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchItemClick = (label) => {
    console.log("asdasd",label);
    setSearchQuery(label);
    handleSearchInput(label);
  };

  const topSearchItems = [
    { src: SearchIcon1, label: 'Cricket' },
    { src: SearchIcon2, label: 'Badminton' },
    { src: SearchIcon3, label: 'Tennis' },
    { src: SearchIcon4, label: 'BasketBall' },
    { src: SearchIcon5, label: 'Cricket' },
    { src: SearchIcon6, label: 'Football' },
  ];

  const showDefaultContent = !searchQuery || activeTab === "search";

  return (
    <div className={styles.mainContent}>
      <div className={styles.topHeader}>
        <div className={styles.searchHeader}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f9dd340588aa26a402df13094927f7087d8cf1ec15bf9df0caa15aa4c44b8570"
            alt="search icon"
            className={styles.searchIcon}
          />
          <input 
            className={styles.input} 
            type="text" 
            placeholder="Search" 
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          {searchQuery ? (
            <>
              <div className={styles.searchToggle}>
                <button
                  className={activeTab === "foryou" ? styles.activeToggle : styles.inactiveToggle}
                  onClick={() => handleTabClick("foryou")}
                >
                  For you
                </button>
                <button
                  className={activeTab === "people" ? styles.activeToggle : styles.inactiveToggle}
                  onClick={() => handleTabClick("people")}
                >
                  People
                </button>
              </div>

              {activeTab === 'foryou' && <ForYou users={searchResults.users} posts={searchResults.posts} />}
              {activeTab === 'people' && <People users={searchResults.users} />}

              {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                <div className={styles.noResults}>
                  No results found for "{searchQuery}"
                </div>
              )}
            </>
          ) : (
            // Default Content
            <>
              <div className={styles.heading}>Top Search</div>
              <div>
                <div className={styles.notificationWrapper}>
                  <div className={styles.gridContainer}>
                    {topSearchItems.map((item, index) => (
                      <SearchItem 
                        key={index} 
                        label={item.label} 
                        src={item.src}
                        onClick={() => handleSearchItemClick(item.label)}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.mobileOnly}>
                  <StayUpdated />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Search;