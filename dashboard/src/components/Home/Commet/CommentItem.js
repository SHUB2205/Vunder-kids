import React from 'react';
import styles from './CommentItem.module.css';

const CommentItem = ({ user, content, createdAt }) => {
  return (
    <div className={styles.commentItem}>
      <img loading="lazy" src={user.avatar} alt={`${user.userName}'s avatar`} className={styles.avatar} />
      <div className={styles.commentContent}>
        <div className={styles.username}>{user.userName}</div>
        <div className={styles.commentText}>{content}</div>
        <div className={styles.commentMeta}>
          <div >{createdAt}</div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;