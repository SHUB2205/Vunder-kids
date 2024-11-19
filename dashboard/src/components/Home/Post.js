import React ,{useContext, useEffect, useState} from 'react';
import styles from './Post.module.css';
import ShareComponent from './Share/ShareComponent';
import { PostContext } from '../../createContext/Post/PostContext';
import { MessageCircle,Heart } from 'lucide-react';
import IsAuth from '../../createContext/is-Auth/IsAuthContext';

function Post({ _id ,creator, createdAt, content, mediaURL, likes,openComment }) {
  const {user} = useContext(IsAuth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {toggleLike} = useContext(PostContext);
  const [isLiked,setLiked] = useState(false);
  const [currLikes , setCurrLikes] = useState(likes);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  useEffect(() => {
    if (user && user.likes.includes(_id)){
      setLiked(true);
    }
  },[user])

  const handleLike = async() => {
   const res = await toggleLike(_id);
   setCurrLikes(res.likes); // updating current likes 
   setLiked(res.isLiked);
  };

  return (
    <>
      <article className={styles.post}>
        <header className={styles.postHeader}>
          <img src={creator ? creator.avatar : ''} alt={`${creator ? creator.userName : ' '}'s avatar`} className={styles.authorAvatar} />
          <div className={styles.authorInfo}>
            <h3 className={styles.authorName}>{creator ? creator.userName : ''}</h3>
            <time className={styles.postTime}>{createdAt}</time>
          </div>
          <button aria-label="Post options" className={styles.postOptions}>
            <img src="http://b.io/ext_22-" alt="" />
          </button>
        </header>
        <p className={styles.postContent}>{content}</p>
        {mediaURL && <img src={mediaURL} alt="Post " className={styles.postImage} />}
        <footer className={styles.postFooter}>
          <div className={styles.postActions}>
            <button aria-label="Like" className={styles.actionButton} onClick={handleLike}>
              {isLiked ? <Heart fill='#FA2A55' color='#FA2A55'/> : <Heart/>}
            </button>
            <button aria-label="Comment" className={styles.actionButton} onClick={() => {openComment(_id)}} >
              <MessageCircle />
            </button>
            <button aria-label="Share" onClick={openModal}  className={styles.actionButton}>
            <svg width={25} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="share"><path fill="#000000" d="m21.707 11.293-8-8A1 1 0 0 0 12 4v3.545A11.015 11.015 0 0 0 2 18.5V20a1 1 0 0 0 1.784.62 11.456 11.456 0 0 1 7.887-4.049c.05-.006.175-.016.329-.026V20a1 1 0 0 0 1.707.707l8-8a1 1 0 0 0 0-1.414ZM14 17.586V15.5a1 1 0 0 0-1-1c-.255 0-1.296.05-1.562.085a14.005 14.005 0 0 0-7.386 2.948A9.013 9.013 0 0 1 13 9.5a1 1 0 0 0 1-1V6.414L19.586 12Z"></path></svg>
            </button>
          </div>
          <p className={styles.likesCount}>{currLikes} likes</p>
          <button className={styles.viewComments}>View all comments</button>
        </footer>
      </article>
      <ShareComponent isOpen={isModalOpen} onClose={closeModal} />
    </>

  );
}

export default Post;
