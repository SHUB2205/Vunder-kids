import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReelContext } from '../../createContext/Reels/ReelContext';
import { ProfileContext } from '../../createContext/Profile/ProfileContext';
import { BsPlayFill } from 'react-icons/bs';
import './ProfileReels.css';
import Reels from '../Reels/Reels';
import CreateReelBox from './Components/CreateReelBox';

function ProfileReels() {
    const { myReels, likedReels, getReels, getLikedReels } = useContext(ReelContext);
    const { userReels = [], getUserReels } = useContext(ProfileContext);
    
    const [selectedReel, setSelectedReel] = useState(null);
    const Options = ['My Reels', 'Liked Reels'];
    const [activeOption, setActiveOption] = useState('My Reels');
    const { username } = useParams();

    // Determine which reels to display
    const reelsToDisplay = username 
        ? userReels 
        : (activeOption === 'My Reels' ? myReels : likedReels);

    useEffect(() => {
        if (username) {
            // If username is present, fetch user-specific reels
            if (userReels.length === 0) {
                getUserReels(username);
            }
        } else {
            // If no username, fetch personal reels and liked reels
            if (myReels.length === 0) {
                getReels(true);
            }
            if (likedReels.length === 0) {
                getLikedReels();
            }
        }
    }, [username,getUserReels]);

    const openReelModal = (reel) => {
        setSelectedReel(reel);
        document.body.style.overflow = 'hidden';
    };

    const closeReelModal = () => {
        setSelectedReel(null);
        document.body.style.overflow = 'unset';
    };

    const formatCount = (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count;
    };

    const renderReelItem = (reel, index) => (
        <div 
            key={reel._id || index}
            className="reel-item"
            onClick={() => openReelModal(reel)}
        >
            <video 
                className="reel-thumbnail"
                poster={reel.thumbnail}
            >
                <source src={reel.videoUrl} type="video/mp4" />
            </video>
            
            <div className="reel-overlay">
                <BsPlayFill className="play-icon" />
                <div className="reel-stats">
                    <div className="stat-item">
                        <span>♥</span>
                        <span>{formatCount(reel.likes?.length || 0)}</span>
                    </div>
                    <div className="stat-item">
                        <span>💬</span>
                        <span>{formatCount(reel.comments?.length || 0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className='reelContainer'>
            {!username && (
                <div className="reelNav">
                    {Options.map((option) => (
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

            <div className="profile-reels-container">
                {username ? (
                    reelsToDisplay.map(renderReelItem)
                ) : (
                    activeOption === 'My Reels' ? (
                        <>
                            <CreateReelBox/>
                            {reelsToDisplay.map(renderReelItem)}
                        </>
                    ) : (
                        reelsToDisplay.map(renderReelItem)
                    )
                )}
            </div>

            {selectedReel && (
                <div className="reel-modal" onClick={closeReelModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <Reels 
                            UserReel={selectedReel} 
                            oncloseButton={() => closeReelModal()} 
                            isSingleReel={true} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileReels;