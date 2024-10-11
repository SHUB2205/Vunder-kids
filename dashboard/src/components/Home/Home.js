import React from 'react';
// import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.contentWrapper}>
      {/* <Header /> */}
        <Sidebar />
        <MainContent />
        <RightSidebar />
      </div>
    </div>
  );
}

export default Home;