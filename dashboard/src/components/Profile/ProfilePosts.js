import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Post from '../Home/Post';
import './ProfilePosts.css';
import { PostContext } from '../../createContext/Post/PostContext';
import { ProfileContext } from '../../createContext/Profile/ProfileContext';
import CommentSection from '../Home/Commet/Comment';

function ProfilePosts() {
    const { 
        Likedposts = [], 
        Myposts = [], 
        getLikedPosts, 
        getPosts 
    } = useContext(PostContext);
    
    const { userPosts = [], getUserPosts } = useContext(ProfileContext);

    const [openPostId, setPostId] = useState(null);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [savedScrollPosition, setSavedScrollPosition] = useState(0);
    
    const postOptions = ['My Posts', 'Liked Posts'];
    const [activeOption, setActiveOption] = useState('My Posts');
    const { username } = useParams();

    // Determine which posts to display
    const postsToDisplay = username 
        ? userPosts 
        : (activeOption === 'My Posts' ? Myposts : Likedposts);

    useEffect(() => {
        // Restore scroll position when comment closes
        window.scrollTo(0, savedScrollPosition);

        // Fetch posts only if necessary
        if (!username) {
            if (Myposts.length === 0) getPosts(true);
            if (Likedposts.length === 0) getLikedPosts();
        } else if (userPosts.length === 0) {
            getUserPosts(username);
        }
    }, [username, isCommentOpen, getUserPosts]);

    const openComment = (postId) => {
        setSavedScrollPosition(window.scrollY);     
        setPostId(postId);
        setIsCommentOpen(true);
    };
    
    const closeComment = () => {     
        setIsCommentOpen(false);     
    };

    // Render posts or comment section
    const renderContent = () => {
        if (isCommentOpen) {
            return <CommentSection onClose={closeComment} postid={openPostId} />;
        }

        return (
            <>
                {username ? null : (
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
                )}
                
                {postsToDisplay.length > 0 ? (
                    postsToDisplay.map(post => (
                        <Post 
                            key={post._id} 
                            {...post} 
                            openComment={openComment} 
                        />
                    ))
                ) : (
                    <div className="no-posts">No posts to display</div>
                )}
            </>
        );
    };

    return (
        <div className="profilePostsContainer">
            {renderContent()}
        </div>
    );
}

export default ProfilePosts;