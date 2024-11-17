import React, { useEffect, useContext, useState } from 'react';
import Post from './Post';
import styles from './MainContent.module.css';
import Header from './Header.js';
import MobileHeader from './MobileHeader.js';
import { PostContext } from '../../createContext/Post/PostContext';
import CommentSection from './Commet/Comment';

function MainContent() {
  const { posts, getPosts } = useContext(PostContext);
  const [openPostId,setPostId] = useState(null);
  const [isCommentOpen,setIsCommentOpen] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  useEffect(() => {
    window.scrollTo(0, savedScrollPosition);
    if (posts.length == 0)
      getPosts();
  }, [isCommentOpen]);

  const openComment = (postId) => {
    setSavedScrollPosition(window.scrollY);     
    setPostId(postId);
    setIsCommentOpen(true);
  };

  const closeComment = () => {     
    setIsCommentOpen(false);     
  };

  return (
    <>
      <main className={`${styles.mainContent}`}>
        <MobileHeader />
        <Header />
        {isCommentOpen ? <CommentSection onClose={closeComment} postid={openPostId} />   : (
           posts && posts.map(post => (
          <Post key={post._id}  {...post} openComment={openComment}  />
        )))}
      </main>
    </>
  );
}

export default MainContent;