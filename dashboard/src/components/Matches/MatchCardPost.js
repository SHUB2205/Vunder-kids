import React from 'react';
import styles from './MatchCardPost.module.css';
import MatchCard from './MatchCard';

const MatchCardPost = ({ isSimplified = false }) => {
  return (
    <article className={styles.matchCardPost}>
      <header className={styles.postHeader}>
        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/18e5091638212e06a8a2d592be1e7b3511be7652ef2a49ca66db7a15d537f3fc?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" alt="User avatar" className={styles.userAvatar} />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>Tyler</h3>
          <time className={styles.postTime}>12 hours ago</time>
        </div>
      </header>
      <p className={styles.postContent}>
        Tyler takes on Ryan in an electrifying 1on1 battle at EverBank Stadium in Jacksonville on Monday, September 14th at 2:00 PM!
      </p>
        <MatchCard />
        <footer className={styles.postFooter}>
        <div className={styles.likeSection}>
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/117bd578dcfa4c17a57e9971de0ee9972e403a4e6408580c975d97bd40502299?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" alt="Like icons" className={styles.likeIcons} />
        </div>
        <p className={styles.likesCount}>223 likes</p>
        <button className={styles.viewComments}>View all comments</button>
        </footer>
    </article>
  );
};

export default MatchCardPost;