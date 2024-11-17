import React, { useContext, useEffect, useState } from 'react';
import styles from './Comment.module.css';
import CommentItem from './CommentItem';
import { PostContext } from '../../../createContext/Post/PostContext';
import IsAuth from '../../../createContext/is-Auth/IsAuthContext';
import { SendHorizontal } from 'lucide-react';

const CommentSection = ({onClose ,postid}) => {
  const {getPostById,createComment} = useContext(PostContext);
  const [comments , setComments] = useState([]);
  const [newComment, setNewComment] = useState(""); 
  const {user} = useContext(IsAuth);

  useEffect(() => {
    getPostById(postid).then( res => {
      setComments(res.comments);
    });
  },[postid]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);  
  };
  const handleSend = async() => {
    setNewComment(newComment.trim());
    if (!newComment.trim()) return;
    const res = await createComment(postid,newComment);
    setComments(prevComments => [{...res.comment,user:{avatar:user.avatar,userName:user.userName,_id:user._id}}, ...prevComments]);
    setNewComment("");
  };

  return (
    <section className={styles.commentSection}>
      <header className={styles.commentHeader}>
        <button onClick={onClose} style={{border:'none',backgroundColor:'white'}}>
          <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/a20c7d8ead96e33949529c5a071049c6798cb526d4a0a5cd1674a26f6df5e000?apiKey=f523408d85c94fc8913d645c993f4c42&" alt="" className={styles.commentIcon} />
        </button>
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
            <img loading="lazy" src={user.avatar} alt="" className={styles.userAvatar} />
          </div>
          <div className={styles.inputHeader}>
            <input type="text" id="commentInput" style={{ font: "var(--font-secondary)", width: "100%", border: "none", outline: "none" }} placeholder="Add a comment" className="visually-hidden" aria-label="Add a comment" onChange={handleCommentChange}  value={newComment}/>
          </div>
          <SendHorizontal color='gray' style={{cursor:'pointer'}} onClick={handleSend}/>
        </form>
      </div>
    </section>
  );
};

export default CommentSection;