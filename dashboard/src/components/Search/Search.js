import React, { useState } from 'react';
import styles from './search.module.css';
import SearchItem from './SearchItem';
import ForYou from './forYou/ForYou';
import People from './People/People';
import SearchIcon1 from '../images/search-1.png'
import SearchIcon2 from '../images/search-2.png'
import SearchIcon3 from '../images/search-3.png'
import SearchIcon4 from '../images/search-4.png'
import SearchIcon5 from '../images/search-5.png'
import SearchIcon6 from '../images/search-6.png'


function Search() {
  // For 'foryou' and 'people' toggle
  const [activeHeads, setActiveHeads] = useState(true);
  const handleHeadClick = (value) => {
    setActiveHeads(value);
  };

  // Dummy data for search items
  const topSearchItems = [
    { src: SearchIcon1, label: 'Football' },
    { src: SearchIcon2, label: 'Football' },
    { src: SearchIcon3, label: 'Football' },
    { src: SearchIcon4, label: 'Football' },
    { src: SearchIcon5, label: 'Football' },
    { src: SearchIcon6, label: 'Football' },
  ];

  return (
    <div className={styles.mainContent}>
      <div className={styles.searchHeader}>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/f9dd340588aa26a402df13094927f7087d8cf1ec15bf9df0caa15aa4c44b8570?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b"
          alt="search icon"
          className={styles.searchIcon}
        />
        <input className={styles.input} type="text" placeholder="Search" aria-label="Search" />
      </div>


      <div className={styles.searchToggle}>
        <button
          className={
            activeHeads === true ? styles.activeToggle : styles.inactiveToggle
          }
          onClick={() => handleHeadClick(true)}
        >
          For you
        </button>
        <button
          className={
            activeHeads === false
              ? styles.activeToggle
              : styles.inactiveToggle
          }
          onClick={() => handleHeadClick(false)}
        >
          People
        </button>
      </div>
      <div className={styles.heading}>
        Top Search
      </div>

      <div className={styles.notificationWrapper}>
        {activeHeads ? (
          <div className={styles.gridContainer}>
            {topSearchItems.map((item, index) => (
              <SearchItem key={index} label={item.label} src={item.src} />
            ))}
          </div>
        ) : (
          < People />
        )
        }
      </div>

      {/* <ForYou /> */}
    </div>
  );
}

export default Search;


