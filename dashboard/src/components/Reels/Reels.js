import ReelsComponent from './ReelsComponent';
import './Reels.css';
import { ReelContext } from '../../createContext/Reels/ReelContext';
import IsAuth from '../../createContext/is-Auth/IsAuthContext';
import { useContext, useEffect } from 'react';

export default function Reels({UserReel,oncloseButton ,isSingleReel = false}) {
      const {reels , getReels} = useContext(ReelContext);
      useEffect(() => {
        if (reels.length === 0)
          getReels();
      },[])

    
      // Customization options for the reels component
      const reelMetaInfo = {
        videoDimensions: {
          height: window.innerWidth <= 768 ? window.innerHeight : 600,
          width: window.innerWidth <= 768 ? window.innerWidth : 340
        },
        backGroundColor: isSingleReel ? 'none' :"#ffffff",
        borderRadius: window.innerWidth <= 768 ? 0 : 12,
        likeActiveColor: "#ff4d4d",
        dislikeActiveColor: "#4d4dff"
      };
      
      const handleShareClick = (reel) => {
        console.log("Share clicked for reel:", reel.id);
      };
    
      const handleAvatarClick = (reel) => {
        console.log("Avatar clicked for reel:", reel.id);
      };
      
  return (
    <div className='reel-container'>
        {reels.length>0 && 
        <ReelsComponent
            reels={isSingleReel ? [UserReel] : reels}
            reelMetaInfo={reelMetaInfo}
            onShareClicked={handleShareClick}
            onAvatarClicked={handleAvatarClick}
            oncloseButton = {oncloseButton}
            isSingleReel = {isSingleReel}
          />}
    </div>
  )
}
