import React, { createRef, useRef, useState, useEffect,useContext } from 'react'

/* React Swiper Import */
import { Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

/* React Menu Import */
import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

/* React Icons Import */
import { GiPauseButton   } from 'react-icons/gi';
import { BsPlayFill, BsThreeDots } from 'react-icons/bs';
import { GiSpeaker, GiSpeakerOff } from 'react-icons/gi';
import { FaThumbsUp } from 'react-icons/fa';
import { BiCommentDetail } from 'react-icons/bi';
import { IoIosShareAlt,IoMdClose } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';

/* Style Sheet Import */
import './ReelsComponent.css';

/* Custom Hook Import */
import useSizeMode, { sizeObj } from './hooks/size';
import { Heart } from 'lucide-react';
import { ReelContext } from '../../createContext/Reels/ReelContext';
import IsAuth from '../../createContext/is-Auth/IsAuthContext';


const ReelsComponent = ({ reels, reelMetaInfo, onShareClicked, onAvatarClicked,oncloseButton ,isSingleReel = false }) => {
  const { toggleLike,createComment,toggleLikeComment } = useContext(ReelContext);
  const {user} = useContext(IsAuth);
  const [newComment, setNewComment] = useState('');

  /* Assigning the size mode according to screen (Custom Hook) */
  const sizeMode = useSizeMode();

  /* Collecting all the Video Element References from the DOM */
  const videoElementRefs = useRef(reels.map(() => createRef()));

  /* State Variables */
  const [currentVideoElementRef, setCurrentVideoElementRef] = useState(videoElementRefs.current[0]); /* Ref. of Current Playing Video Element */
  const [isPlayingVideo, setIsPlayingVideo] = useState(true); /* Video is playing or not */
  const [isAudioOn, setIsAudioOn] = useState(false); /* Audio is on or not */
  const rightMenu =  {
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
  };

  const [reelData, setReelData] = useState(reels.map(reel => ({
    id: reel._id,
    likes: {
      isTap: user ? reel.likes.includes(user._id) : false,
      count: reel.likes.length
    },
    comments : reel.comments || [],
  })));

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  /* Life Cycle Hook (In this case runs only once after load) */
  useEffect(() => {
    /* Playing the First video */
    isPlayingVideo ? currentVideoElementRef?.current?.play()
                   : currentVideoElementRef?.current?.pause()

    /* Pausing the rest of videos */
    let otherVideoElementRefs = videoElementRefs.current.filter((_, index) => index !== 0);
    otherVideoElementRefs.forEach(ref => {
      ref.current?.pause();
    })
  }, []) // Dependency array should be blank in order to run useEffect only once

  const handleSlideChange = (event) => {
    /* Current Video Ref. */
    setIsCommentModalOpen(false);
    let currentVideoElementRef = videoElementRefs.current.find((_, index) => index === event.realIndex);
    /* Other Video Refs. */
    let otherVideoElementRefs = videoElementRefs.current.filter((_, index) => index !== event.realIndex);

    /* Set the ref. of Current Video and required booleans */
    if(currentVideoElementRef) {
      setCurrentVideoElementRef(currentVideoElementRef);
      setIsPlayingVideo(true);
    }

    /* Play the current Video */
    currentVideoElementRef?.current?.play();
   
    /* Pausing other videos */
    otherVideoElementRefs.forEach(ref => {
      ref.current?.pause();
    })
  }
  
  const handlePlayPauseVideo = (isPlaying) => {  
    if(isPlaying) {
      setIsPlayingVideo(true);
      currentVideoElementRef?.current?.play();
    } else {
      setIsPlayingVideo(false);
      currentVideoElementRef?.current?.pause();
    }
  }

  const handleClickOnVideo = () => {
    isPlayingVideo ? handlePlayPauseVideo(false) 
                   : handlePlayPauseVideo(true);
  }

  const handleAudio = (event, isOn) => {
    /* Preventing the click event to propagate to video element */
    event.stopPropagation();    
    let otherVideoElementRefs = videoElementRefs.current.filter((_, index) => index !== event.realIndex);
    if(isOn) {
      setIsAudioOn(true);
      currentVideoElementRef.current.muted = false;
    } else {
      setIsAudioOn(false);
      currentVideoElementRef.current.muted = true;
    }

    otherVideoElementRefs.forEach(ref => {
      ref.current.muted = !isOn;
    })
  }


  const handleLikeClick = async (reelId , index) => {
    try {
      if (!user) return;
      const response = await toggleLike(reelId);
      
      const updatedReelData = [...reelData]; // Create a shallow copy to maintain React's state update principles
      updatedReelData[index].likes.isTap = !updatedReelData[index].likes.isTap;
      updatedReelData[index].likes.count = updatedReelData[index].likes.isTap
        ? updatedReelData[index].likes.count + 1
        : updatedReelData[index].likes.count - 1;
      
      setReelData(updatedReelData);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }


  const handleCommentClick = (reel) => {
    setIsCommentModalOpen(true);
    if (swiper) {
      swiper.disable();
    }
  }

  const handleShareClick = (reel) => {
    if(onShareClicked) onShareClicked(reel)
  }

  const handleAvatarClicked = (reel) => {
    if(onAvatarClicked) onAvatarClicked(reel)
  }

  const handleCommentSubmit = async (e, reelId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await createComment(reelId, newComment);
      
      // Update local state with new comment
      const updatedReelData = reelData.map(reel => {
        if (reel.id === reelId) {
          return {
            ...reel,
            comments: [response.comment,...reel.comments]
          };
        }
        return reel;
      });
      
      setReelData(updatedReelData);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCommentLike = async (commentId,reel_idx,cmt_idx) => {
    try {
      await toggleLikeComment(commentId);
      // Update local state to reflect the like
      const updatedReelData = [...reelData]; // Clone the reelData array to avoid mutating the original state

      const reel = updatedReelData[reel_idx]; // Access the specific reel
      const comment = reel.comments[cmt_idx]; // Access the specific comment

      // Toggle the like status for the comment
      comment.likeCount = comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1;
      comment.isLiked = !comment.isLiked;

      setReelData(updatedReelData);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const numberFilter = (num) => {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find((item) => num >= item.value);
    return item
      ? (num / item.value).toFixed(1).replace(rx, "$1") + item.symbol
      : "0";
  };

  const [swiper, setSwiper] = useState(null);

  return (
    <>
      <Swiper
        onSwiper={setSwiper}
        style={{backgroundColor: reelMetaInfo?.backGroundColor || '#000000' }}
        direction={'vertical'}
        mousewheel={true}
        modules={[Mousewheel]}
        slidesPerView={1}
        onSlideChange={(event) => handleSlideChange(event)}
        className='swiper-tag'
      >
        {reels.map((reel, index) => (
          <SwiperSlide key={reel._id}>
            <div 
              style={{ backgroundColor: reelMetaInfo?.backGroundColor || '#000000' }}
              className='background'
            >
              {/* Wrapper of the video element */}
              <div 
                style={{
                  height: sizeMode === sizeObj.extraSmallScreen ? '100%' : `${reelMetaInfo?.videoDimensions?.height}px` || '580px',
                  width: sizeMode === sizeObj.extraSmallScreen ? '100%' : `${reelMetaInfo?.videoDimensions?.width}px` || '330px',
                  borderRadius: sizeMode === sizeObj.extraSmallScreen ? '0px' : (`${reelMetaInfo?.borderRadius}px` || '10px')
                }}
                className='videoWrapper'
              >
                {/* Play/Pause buttons (Only for Desktop Screens) */}
                {isPlayingVideo ? (
                  <GiPauseButton
                    size={25}
                    className='pauseIcon'
                    onClick={() => handlePlayPauseVideo(false)}
                  />
                ) : (
                  <BsPlayFill
                    size={27}
                    className='playIcon'
                    onClick={() => handlePlayPauseVideo(true)}
                  />
                )}

                

                {/* Audio On/Off buttons (Only for Desktop Screens) */}
                <div className='topRightContainer'>
                  {isAudioOn ? (
                    <GiSpeaker
                    size={27}
                    className='speakerOnIcon'
                    onClick={(e) => handleAudio(e, false)}
                    />
                  ) : (
                    <GiSpeakerOff
                    size={27}
                    className='speakerOffIcon'
                    onClick={(e) => handleAudio(e, true)}
                    />
                  )}
                  {isSingleReel && 
                    <IoMdClose size={27} className='closeButton' onClick={oncloseButton}/>
                  }
                </div>

                {/* Middle play/pause Icon */}
                {isPlayingVideo ? (
                  <BsPlayFill 
                    size={55}
                    className='bigPlayIcon'
                  />
                ) : (
                  <GiPauseButton
                    size={50}
                    className='bigPauseIcon'
                  />
                )}

                {/* Video Element */}
                <video 
                  style={{ borderRadius: sizeMode === sizeObj.extraSmallScreen ? '0px' : (`${reelMetaInfo?.borderRadius}px` || '10px') }}
                  className='video'
                  ref={videoElementRefs.current[index]}
                  controls={false}
                  muted
                  autoPlay
                  playsInline
                  loop
                  onClick={handleClickOnVideo}
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate"
                >
                  <source src={reel.videoUrl} type={'video/mp4'} /> 
                </video>

                {/* Right Side Options */}
                <div className={(sizeMode <= sizeObj.smallScreen  || isSingleReel)? 'sideBarIconsForSmallScreen' : 'sideBarIcons'}>
                  {/* Three Dot Menu Icon */}
                  {!isSingleReel && (
                    <div>
                      <Menu
                        menuButton={
                          <span>
                            {sizeMode === sizeObj.extraSmallScreen ? (
                              <BsThreeDots size={25} />
                            ) : (
                              <BsThreeDotsVertical size={25} />
                            )}
                          </span>
                        }
                      >
                        {rightMenu.options.map((option) => (
                          <MenuItem key={option.id} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Menu> 
                    </div>
                  )}

                  {/* Like Icon */}
                  {reel.likes && (
                    <div onClick={() => handleLikeClick(reel._id,index)}>
                      <FaThumbsUp size={25} color={reelData[index].likes.isTap ? (reelMetaInfo?.likeActiveColor || '#3da6ff') : (sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen || isSingleReel)? 'white' : 'black'} />
                      <span className='likeText'>{ numberFilter(reelData[index].likes.count) !== '0' ? numberFilter(reelData[index].likes.count) : 'Like' }</span>
                    </div>
                  )}
                  

                  {/* Comment Icon */}
                  {reel.comments && (
                    <div onClick={() => handleCommentClick(reel)}>
                      <BiCommentDetail size={25} color={(sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen || isSingleReel)? 'white' : 'black'} />
                      <span className='commentText'>{ numberFilter(reel.comments.length) !== '0' ? numberFilter(reel.comments.length) : 'Comment' }</span>
                    </div>
                  )}

                  {/* Share Icon */}
                  {reel.shares && (
                    <div onClick={() => handleShareClick(reel)}>
                      <IoIosShareAlt size={25} color={(sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen || isSingleReel)? 'white' : 'black'}/>
                      <span className='shareText'>{ numberFilter(reel.shares.count) !== '0' ? numberFilter(reel.shares.count) : 'Share' }</span>
                    </div>
                  )}
                </div>
                

                {/* Bottom Side */}
                {reel.bottomSection ? (
                  <div style={{ position: 'absolute', bottom: '0px' }}>
                    { reel.bottomSection.component }
                  </div>
                ) : (
                  <div className='bottomBar'>
                    {reel.description && (
                      <div>
                        <label>{reel.description}</label>
                      </div>
                    )}
                    {reel.userId && (
                      <div onClick={() => handleAvatarClicked(reel)}>
                        <img 
                          src={reel.userId.avatar} 
                          alt="profile-image" 
                        />
                        <label>{reel.userId.userName}</label>
                      </div>
                    )}
                  </div>
                )}

                {/* Comment Modal */}
                <div className={`commentModal ${isCommentModalOpen ? 'open' : ''}`}
                 onWheel={(e) => e.stopPropagation()} // Prevent wheel events from propagating
                 onTouchMove={(e) => e.stopPropagation()} // Prevent touch events from propagating
                >
                  <div className="commentModalHeader">
                    <h2 className="commentModalTitle">Comments</h2>
                    <button className="commentModalClose" onClick={() => {setIsCommentModalOpen(false);if (swiper) swiper.enable();}}>&times;</button>
                  </div>
                  <div className="commentList">
                    {reelData[index].comments && reelData[index].comments.map((comment, cmtIdx) => (
                      <div key={cmtIdx} className="commentItem">
                        <img src={comment.user.avatar} alt={`${comment.user.userName}'s avatar`} className="commentAvatar" />
                        <div className='cmtContentWrapper'>
                          <div className="commentContent">
                            <div className="commentUsername">{comment.user.userName}</div>
                            <div className="commentText">{comment.content}</div>
                            <div className="commentTime">{comment.createdAt}</div>
                          </div>
                          <div className='commentLikeContainer' onClick={() => handleCommentLike(comment._id,index,cmtIdx)}>
                            <Heart 
                            size={18} 
                            fill={comment.isLiked ? '#ff4d4d' : 'none'}
                            color={comment.isLiked ? '#ff4d4d' : 'currentColor'}
                            />
                            <p>{numberFilter(comment.likeCount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form className="commentForm" onSubmit={(e) => handleCommentSubmit(e, reel._id)}>
                    <input type="text"  className="commentInput" onChange={(e) => setNewComment(e.target.value)} value={newComment} />
                    <button type="submit" className="commentSubmit" disabled={!newComment.trim()}>Post</button>
                  </form>
                </div>
              </div>
              
            </div>
            
          </SwiperSlide>
        ))}
      </Swiper>

      
    </>
  )
}

export default ReelsComponent

