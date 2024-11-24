import React, { useContext, useEffect, useState } from 'react';
import { ReelContext } from '../../createContext/Reels/ReelContext';
import { BsPlayFill } from 'react-icons/bs';
import './ProfileReels.css';
import Reels from '../Reels/Reels';
import CreateReelBox from './Components/CreateReelBox';

function ProfileReels() {
    const { likedReels,myReels,getLikedReels,getReels } = useContext(ReelContext);
    const [selectedReel, setSelectedReel] = useState(null);
    const Options = ['My Reels' ,'Liked Reels'];
    const [activeOption,setActiveOption] = useState('My Reels');

    useEffect(() => {
        if (myReels.length === 0) {
            getReels(true);
        }
        if (likedReels.length === 0){
            getLikedReels();
        }
    }, []);

    const openReelModal = (reel) => {
        setSelectedReel(reel);
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    const closeReelModal = () => {
        setSelectedReel(null);
        // Restore body scrolling when modal is closed
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

    return (
        <div className='reelContainer'>
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
            <div className="profile-reels-container">
                {activeOption === 'My Reels'  ? 
                <>
                <CreateReelBox/>
                {myReels.map((reel, index) => (
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
                ))}
                </>
                :
                likedReels.map((reel, index) => (
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
                ))
                }
            </div>

            {selectedReel && (
                <div className="reel-modal" onClick={closeReelModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <Reels UserReel={selectedReel} oncloseButton={() => closeReelModal()} isSingleReel={true} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileReels;