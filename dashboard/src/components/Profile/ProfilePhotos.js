import React, { useContext, useEffect, useState } from 'react';
import './ProfilePhotos.css';
import { PostContext } from '../../createContext/Post/PostContext';

function ProfilePhotos() {
    const [selectedImage, setSelectedImage] = useState(null);
    const {Myposts,getPosts} = useContext(PostContext);

    // const photo_url = "https://s3-alpha-sig.figma.com/img/c544/a551/da362a82992c68a57b43daccc6b536e8?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=AkP9IopUvpbPaAkAiK-9o9Rn0zjCIQumaWxgEy6-mzBvec0J4iY7qDJWfeut5-eOIBEtqJ66B73lW5~ujUgtbCRQzrAkZLNR7bbRYXZSDiaVnwsUtinZ4bLBkDkZ02jAT-bKIugmcWXswHpeC~aEEEN-DysytvWnmLqpM34ijNDhbUqWUfIJ3wYxiu3GZURRMyZIcstMu97KHgn8Pn-lEZY7lgVZN2j4fZTs38D4AFuMnKVwaOPBhp318eRaek4gYVDEa4nBUXMw1jXfxhZK0X-UoaAEG8mwbKQgIN9wIhUhptXhh7MqLL0JMq-ZL12DPF7ZURdJHnFRpVcjkqWw6A__";
    // const posts = [
    //     {image: photo_url},
    //     {image: photo_url},
    //     {image: photo_url},
    //     {image: photo_url},
    //     {image: photo_url},
    //     {image: photo_url}
    // ];

    useEffect(() => {
        if (Myposts.length == 0)
            getPosts(true);
    },[]);

    const openModal = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <div className="profilePhotosContainer">
                {Myposts && Myposts.map((post, index) => (
                    (post.mediaType === 'image' && post.mediaURL && <img 
                        key={index}
                        src={post.mediaURL} 
                        alt={`image-${index}`}
                        onClick={() => openModal(post.mediaURL)}
                    />)
                ))}
            </div>

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