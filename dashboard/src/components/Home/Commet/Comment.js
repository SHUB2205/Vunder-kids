import React from 'react';
import styles from './Comment.module.css';
import CommentItem from './CommentItem';
import { Link } from 'react-router-dom';

const CommentSection = () => {
  const comments = [
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/a646bc7c78798f7a29291c3c6f28bba54bd5f27344e4131469868283747cb9c7?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Shesyu",
      comment: "Amazing!!!! ",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/a9bcf2aff41487be7f92a9bf00dbc1fa97217401194e42387f7c56e929a4af15?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Ashiner",
      comment: "Volley Central all the way!",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/4ebae1906a80937a1e12824e100aaccda083c4b5dd9be05844e37438edfc80a0?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Kalyan",
      comment: "Champions in the making!",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/67053472dfd68826bab7620891ab4ef86fb247c0851bef6dc0ab17ed1c03efd5?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Ashiner",
      comment: "What a strike!",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/67053472dfd68826bab7620891ab4ef86fb247c0851bef6dc0ab17ed1c03efd5?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Ashiner",
      comment: "What a strike!",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/67053472dfd68826bab7620891ab4ef86fb247c0851bef6dc0ab17ed1c03efd5?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Ashiner",
      comment: "What a strike!",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/67053472dfd68826bab7620891ab4ef86fb247c0851bef6dc0ab17ed1c03efd5?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Ashiner",
      comment: "What a strike!",
      time: "19h"
    },
    {
      avatar: "https://cdn.builder.io/api/v1/image/assets/TEMP/67053472dfd68826bab7620891ab4ef86fb247c0851bef6dc0ab17ed1c03efd5?apiKey=f523408d85c94fc8913d645c993f4c42&",
      username: "Ashiner",
      comment: "What a strike!",
      time: "19h"
    }
  ];

  return (
    <section className={styles.commentSection}>
      <header className={styles.commentHeader}>
        <Link to="/home">
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/a20c7d8ead96e33949529c5a071049c6798cb526d4a0a5cd1674a26f6df5e000?apiKey=f523408d85c94fc8913d645c993f4c42&" alt="" className={styles.commentIcon} />
        </Link>
        <h2 className={styles.commentLabel}>Comment</h2>
      </header>
      <div className={styles.commentList}>
        {comments.map((comment, index) => (
          <CommentItem key={index} {...comment} />
        ))}
      </div>
      <div className={styles.commentInputContainerBox}>
        <form className={styles.commentInputContainer}>
          <div className={styles.commentInputWrapper}>
            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/2c6d299fc9acc5168ffe5f34fd840a1445989972f202793e49c2c2adb01ae5d6?apiKey=f523408d85c94fc8913d645c993f4c42&" alt="" className={styles.userAvatar} />
          </div>
          <div className={styles.inputHeader}>
            <input type="text" id="commentInput" style={{ font: "var(--font-secondary)", width: "100%", border: "none", outline: "none" }} placeholder="Add a comment" className="visually-hidden" aria-label="Add a comment" />
          </div>
          <img loading="lazy" style={{cursor:"pointer"}} src="https://cdn.builder.io/api/v1/image/assets/TEMP/fddf31f6962fb25d2e50e3b6a1494b2d18430e94cd6a625e6ab801cec12f6eba?apiKey=f523408d85c94fc8913d645c993f4c42&" alt="" className={styles.sendIcon} />
        </form>
      </div>
    </section>
  );
};

export default CommentSection;