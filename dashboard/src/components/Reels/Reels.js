import React from 'react'
import ReelsComponent from './ReelsComponent';
import './Reels.css';

export default function Reels() {
      const reelsData = [
        {
          id: 1,
          reelInfo: {
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            type: "video/mp4",
            description: "Amazing sunset at the beach! 🌅",
            postedBy: {
              avatar: "https://i.pinimg.com/736x/13/61/6f/13616feb961d454bfc0d7cdf6a2fc323.jpg",
              name: "John Doe"
            },
            likes: {
              count: 1523
            },
            dislikes: {
              count: 23
            },
            comments: {
              count: 89
            },
            shares: {
              count: 45
            }
          },
          rightMenu: {
            options: [
              {
                id: 1,
                label: "Save",
                value: "save"
              },
              {
                id: 2,
                label: "Report",
                value: "report"
              },
              {
                id: 3,
                label: "Not Interested",
                value: "not_interested"
              }
            ]
          }
        },
        {
          id: 2,
          reelInfo: {
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            type: "video/mp4",
            description: "Quick cooking tips for beginners 👨‍🍳",
            postedBy: {
              avatar: "https://example.com/avatars/user2.jpg",
              name: "Jane Smith"
            },
            likes: {
              count: 2845
            },
            dislikes: {
              count: 45
            },
            comments: {
              count: 156
            },
            shares: {
              count: 78
            }
          },
          rightMenu: {
            options: [
              {
                id: 1,
                label: "Save",
                value: "save"
              },
              {
                id: 2,
                label: "Report",
                value: "report"
              }
            ]
          }
        }
      ];
    
      // Customization options for the reels component
      const reelMetaInfo = {
        videoDimensions: {
          height: window.innerWidth <= 768 ? window.innerHeight : 600,
          width: window.innerWidth <= 768 ? window.innerWidth : 340
        },
        backGroundColor: "#ffffff",
        borderRadius: window.innerWidth <= 768 ? 0 : 12,
        likeActiveColor: "#ff4d4d",
        dislikeActiveColor: "#4d4dff"
      };
    
    
      const handleMenuItemClick = (event) => {
        console.log("Menu item clicked:", event.value);
      };
    
      const handleLikeClick = (reel) => {
        console.log("Like clicked for reel:", reel.id);
      };
    
      const handleDislikeClick = (reel) => {
        console.log("Dislike clicked for reel:", reel.id);
      };
    
      const handleCommentClick = (reel) => {
        console.log("Comment clicked for reel:", reel.id);
      };
    
      const handleShareClick = (reel) => {
        console.log("Share clicked for reel:", reel.id);
      };
    
      const handleAvatarClick = (reel) => {
        console.log("Avatar clicked for reel:", reel.id);
      };
      
  return (
    <div className='reel-container'>
        <ReelsComponent
            reels={reelsData}
            reelMetaInfo={reelMetaInfo}
            onMenuItemClicked={handleMenuItemClick}
            onLikeClicked={handleLikeClick}
            onDislikeClicked={handleDislikeClick}
            onCommentClicked={handleCommentClick}
            onShareClicked={handleShareClick}
            onAvatarClicked={handleAvatarClick}
          />
    </div>
  )
}
