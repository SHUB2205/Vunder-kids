import React, { useState } from 'react';
import styles from './Header.module.css';
import addPhoto from "../images/addPhoto.png"
import UserPhoto from '../images/UserPhoto.png'
import addScore from "../images/addScore.png"
function Header() {
  const [postContent, setPostContent] = useState('');

  const handlePostSubmit = (e) => {
    e.preventDefault();
    console.log('Post submitted:', postContent);
    setPostContent('');
  };

  return (
    <header className={styles.header}>
      <form onSubmit={handlePostSubmit} className={styles.postForm}>
        <img src={UserPhoto} alt="User avatar" className={styles.userAvatar} />
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.postInput}
            placeholder="Game face on! What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            aria-label="Create a new post"
          />
          <div className={styles.postActions}>
            <button type="button" className={styles.actionButton}>
              <img src={addPhoto} alt="" className={styles.actionIcon} />
              <span>Photo/Video</span>
            </button>
            <button type="button" className={styles.actionButton}>
              <span className={styles.actionIcon} role="img" aria-label="Basketball">🏀</span>
              <span>Set Match</span>
            </button>
            <button type="button" className={styles.actionButton}>
              <img src={addScore} alt="" className={styles.actionIcon} />
              <span>Add Score</span>
            </button>
          </div>
          <button type="submit" className={styles.postButton}>Post</button>
        </div>
      </form>
    </header>
  );
}

export default Header;