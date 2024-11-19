import React from 'react';
import Post from '../Home/Post';
import './ProfilePosts.css';
import {PostContext} from '../../createContext/Post/PostContext';
import CommentSection from '../Home/Commet/Comment';
import { useState,useEffect,useContext } from 'react';

function ProfilePosts() {
    const {Likedposts,Myposts,getLikedPosts,getPosts } = useContext(PostContext);
    const [openPostId,setPostId] = useState(null);
    const [isCommentOpen,setIsCommentOpen] = useState(false);
    const [savedScrollPosition, setSavedScrollPosition] = useState(0);
    const postOptions = ['My Posts' ,'Liked Posts'];
    const [activeOption,setActiveOption] = useState('My Posts');

    useEffect(() => {
        window.scrollTo(0, savedScrollPosition);
        if (Myposts.length == 0)
            getPosts(true);
        if (Likedposts.length == 0)
            getLikedPosts();
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
        <div className="profilePostsContainer">
            <div className="postNav">
                {postOptions.map((option) => (
                    <p
                        key={option}
                        className={`Tab ${activeOption === option ? "Tab_active" : ""}`}
                        onClick={() => setActiveOption(option)}
                    >
                        {option}
                    </p>
                ))}
            </div>
            {isCommentOpen ? (
                <CommentSection onClose={closeComment} postid={openPostId} />
                ) : (
                activeOption === 'My Posts' ? (
                    Myposts && Myposts.map(post => (
                    <Post key={post._id} {...post} openComment={openComment} />
                    ))
                ) : (
                    Likedposts && Likedposts.map(post => (
                    <Post key={post._id} {...post} openComment={openComment} />
                    ))
                )
            )}
        </div>
    );
}

export default ProfilePosts;
