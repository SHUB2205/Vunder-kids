import React from 'react';
import styles from './CommentItem.module.css';

const CommentItem = ({ avatar, username, comment, time }) => {
  return (
    <div className={styles.commentItem}>
      <img loading="lazy" src={avatar} alt={`${username}'s avatar`} className={styles.avatar} />
      <div className={styles.commentContent}>
        <div className={styles.username}>{username}</div>
        <div className={styles.commentText}>{comment}</div>
        <div className={styles.commentMeta}>
          <div >{time}</div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;