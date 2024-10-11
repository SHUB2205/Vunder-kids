import React from 'react';
import styles from './Post.module.css';

function Post({ author, avatar, time, content, image, likes }) {
  return (
    <article className={styles.post}>
      <header className={styles.postHeader}>
        <img src={avatar} alt={`${author}'s avatar`} className={styles.authorAvatar} />
        <div className={styles.authorInfo}>
          <h3 className={styles.authorName}>{author}</h3>
          <time className={styles.postTime}>{time}</time>
        </div>
        <button aria-label="Post options" className={styles.postOptions}>
          <img src="http://b.io/ext_22-" alt="" />
        </button>
      </header>
      <p className={styles.postContent}>{content}</p>
      {image && <img src={image} alt="Post " className={styles.postImage} />}
      <footer className={styles.postFooter}>
        <div className={styles.postActions}>
          <button aria-label="Like" className={styles.actionButton}>
            <img src="http://b.io/ext_23-" alt="" />
          </button>
          <button aria-label="Comment" className={styles.actionButton}>
            <img src="http://b.io/ext_24-" alt="" />
          </button>
          <button aria-label="Share" className={styles.actionButton}>
            <img src="http://b.io/ext_25-" alt="" />
          </button>
        </div>
        <p className={styles.likesCount}>{likes} likes</p>
        <button className={styles.viewComments}>View all comments</button>
      </footer>
    </article>
  );
}

export default Post;