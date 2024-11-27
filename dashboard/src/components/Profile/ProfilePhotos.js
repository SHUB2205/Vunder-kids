import React, { useContext, useEffect, useState } from 'react';
import './ProfilePhotos.css';
import { PostContext } from '../../createContext/Post/PostContext';
import { useParams } from 'react-router-dom';
import { ProfileContext } from '../../createContext/Profile/ProfileContext';

function ProfilePhotos() {
    const [selectedImage, setSelectedImage] = useState(null);
    const {Myposts,getPosts} = useContext(PostContext);
    const {username} = useParams();
    const { userPosts = [], getUserPosts } = useContext(ProfileContext);
    const postsToDisplay = username ? userPosts : Myposts; 

    useEffect(() => {
        if (!username && Myposts.length == 0)
            getPosts(true);
        if (username && userPosts.length == 0)
            getUserPosts(username);  
    },[username, getUserPosts]);

    const openModal = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const content = () => {
        return(
            <div className="profilePhotosContainer">
                {postsToDisplay && postsToDisplay.map((post, index) => (
                    (post.mediaType === 'image' && post.mediaURL && <img 
                        key={index}
                        src={post.mediaURL} 
                        alt={`image-${index}`}
                        onClick={() => openModal(post.mediaURL)}
                    />)
                ))}
            </div>
        );
    }

    return (
        <>
            {content()}

            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>×</button>
                        <img 
                            src={selectedImage} 
                            alt="Full screen" 
                            className="full-screen-image"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePhotos;