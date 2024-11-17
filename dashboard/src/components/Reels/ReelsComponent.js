import React, { createRef, Fragment, useRef, useState,useEffect } from 'react'

/* React Swiper Import */
import { Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

/* React Menu Import */
import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

/* React Icons Import */
import { GiPauseButton } from 'react-icons/gi';
import { BsPlayFill, BsThreeDots } from 'react-icons/bs';
import { GiSpeaker, GiSpeakerOff } from 'react-icons/gi';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { BiCommentDetail } from 'react-icons/bi';
import { IoIosShareAlt } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';

/* Style Sheet Import */
import './ReelsComponent.css';

/* Custom Hook Import */
import useSizeMode, { sizeObj } from './hooks/size';

const ReelsComponent = ({ reels, reelMetaInfo, onMenuItemClicked, onLikeClicked, onDislikeClicked, onCommentClicked, onShareClicked, onAvatarClicked }) => {

  /* Assigning the size mode according to screen (Custom Hook) */
  const sizeMode = useSizeMode();

  /* Collecting all the Video Element References from the DOM */
  const videoElementRefs = useRef(reels.map(() => createRef()));

  /* State Variables */
  const [currentVideoElementRef, setCurrentVideoElementRef] = useState(videoElementRefs.current[0]); /* Ref. of Current Playing Video Element */
  const [isPlayingVideo, setIsPlayingVideo] = useState(true); /* Video is playing or not */
  const [isAudioOn, setIsAudioOn] = useState(false); /* Audio is on or not */
  const [reelData, setReelData] = useState(reels.map(reel => ({
    id: reel.id,
    likes: {
      isTap: false,
      count: reel.reelInfo.likes?.count
    },
    dislikes: {
      isTap: false,
      count: reel.reelInfo.dislikes?.count
    }
  })));

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

  const handleMenuItemClicked = (event) => {
    if(onMenuItemClicked) onMenuItemClicked(event);
  }

  const handleLikeClick = (reel) => {
    let reelDataDeepCopy = [...reelData];

    reelDataDeepCopy.forEach(_reel => {
      if(_reel.id === reel.id) {
        if(!_reel.likes.isTap) {
          _reel.likes.count += 1
          _reel.likes.isTap = true;
          if(_reel.dislikes.isTap) {
            _reel.dislikes.isTap = false
            _reel.dislikes.count -= 1
          }
        } else {
          _reel.likes.count -= 1
          _reel.likes.isTap = false;
        }
      }
    })

    setReelData(reelDataDeepCopy)
    if(onLikeClicked) onLikeClicked(reel)
  }

  const handleDislikeClick = (reel) => {
    let reelDataDeepCopy = [...reelData];

    reelDataDeepCopy.forEach(_reel => {
      if(_reel.id === reel.id) {
        if(!_reel.dislikes.isTap) {
          _reel.dislikes.count += 1
          _reel.dislikes.isTap = true;
          if(_reel.likes.isTap) {
            _reel.likes.isTap = false
            _reel.likes.count -= 1
          }
        } else {
          _reel.dislikes.count -= 1
          _reel.dislikes.isTap = false;
        }
      }
    })

    setReelData(reelDataDeepCopy)
    if(onDislikeClicked) onDislikeClicked(reel)
  }

  const handleCommentClick = (reel) => {
    if(onCommentClicked) onCommentClicked(reel)
  }

  const handleShareClick = (reel) => {
    if(onShareClicked) onShareClicked(reel)
  }

  const handleAvatarClicked = (reel) => {
    if(onAvatarClicked) onAvatarClicked(reel)
  }

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


  return (
    <>
      <Swiper
        style={{backgroundColor: reelMetaInfo?.backGroundColor || '#000000' }}
        direction={'vertical'}
        mousewheel={true}
        modules={[Mousewheel]}
        slidesPerView={1}
        onSlideChange={(event) => handleSlideChange(event)}
        className='swiper-tag'
      >
        {reels.map((reel, index) => (
          <SwiperSlide key={reel.id}>

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
                    {
                      /* Play/Pause buttons (Only for Desktop Screens) */ 
                      (                 
                            isPlayingVideo ? (
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
                            )
                        
                      )
                      /* Play/Pause buttons (Only for Desktop Screens) */
                    }

                    {
                      /* Audio On/Off buttons (Only for Desktop Screens) */
                        isAudioOn ? (
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
                              )
                        /* Audio On/Off buttons (Only for Desktop Screens) */
                    }

                    

                    {
                      /* Middle play/pause Icon */
                        isPlayingVideo ? (
                          <BsPlayFill 
                            size={55}
                            className='bigPlayIcon'
                          />
                        ) : (
                            <GiPauseButton
                              size={50}
                              className='bigPauseIcon'
                            />
                        )
                      /* Middle play/pause Icon */
                    } 

                    {/* Video Element */}
                    <video 
                        style={{ borderRadius: sizeMode === sizeObj.extraSmallScreen ? '0px' : (`${reelMetaInfo?.borderRadius}px` || '10px') }}
                        className='video'
                        ref={videoElementRefs.current[index]}
                        controls={false} // Default control options off
                        muted // audio off by default
                        autoPlay // auto play video is on by default
                        playsInline // needed for Safari browser
                        loop // starting the video again when ended
                        onClick={handleClickOnVideo}
                        disablePictureInPicture
                        controlsList="nodownload noplaybackrate"
                      >
                        <source src={reel.reelInfo.url} type={reel.reelInfo.type} /> 
                    </video>
                    {/* Video Element */}
                    
                    {/* Right Side Options */}
                    <div className={sizeMode <= sizeObj.smallScreen ? 'sideBarIconsForSmallScreen' : 'sideBarIcons'}>
                      
                      {/* Three Dot Menu Icon */}
                      {
                        reel.rightMenu ? (
                          <div>
                            <Menu
                              menuButton={
                                <span>
                                {
                                  sizeMode === sizeObj.extraSmallScreen ? (
                                    <BsThreeDots size={25} />
                                  ) : (
                                    <BsThreeDotsVertical size={25} />
                                  )
                                } 
                                </span>
                              }
                              onItemClick={(e) => handleMenuItemClicked(e)}
                            >
                              {
                                reel.rightMenu.options.map((option) => {
                                  return (<MenuItem key={option.id} value={option.value}>{ option.label }</MenuItem>)
                                })
                              }
                            </Menu> 
                          </div>
                        ) : (<div></div>)
                      }
                      {/* Three Dot Menu Icon */}

                      {/* Like Icon */}
                      {
                        reel.reelInfo.likes && (
                          <div onClick={() => handleLikeClick(reel)}>
                            <FaThumbsUp size={25} color={reelData[index].likes.isTap ? (reelMetaInfo?.likeActiveColor || '#3da6ff') : (sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen)? 'white' : 'black'} />
                            <span className='likeText'>{ numberFilter(reelData[index].likes.count) !== '0' ? numberFilter(reelData[index].likes.count) : 'Like' }</span>
                          </div>
                        )
                      }
                      {/* Like Icon */}

                      {/* Dislike Icon */}
                      {
                        reel.reelInfo.dislikes && (
                          <div onClick={() => handleDislikeClick(reel)}>
                            <FaThumbsDown size={25} color={reelData[index].dislikes.isTap ? (reelMetaInfo?.dislikeActiveColor || '#3da6ff' ) : (sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen)? 'white' : 'black' } />
                            <span className='dislikeText'>{ numberFilter(reelData[index].dislikes.count) !== '0' ? numberFilter(reelData[index].dislikes.count) : 'Dislike' }</span>
                          </div>
                        )
                      }
                      {/* Dislike Icon */}

                      {/* Comment Icon */}
                      {
                        reel.reelInfo.comments && (
                          <div onClick={() => handleCommentClick(reel)}>
                            <BiCommentDetail size={25} color={(sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen)? 'white' : 'black'} />
                            <span className='commentText'>{ numberFilter(reel.reelInfo.comments.count) !== '0' ? numberFilter(reel.reelInfo.comments.count) : 'Comment' }</span>
                          </div>
                        )
                      }
                      {/* Comment Icon */}

                      {/* Share Icon */}
                      {
                        reel.reelInfo.shares && (
                          <div onClick={() => handleShareClick(reel)}>
                            <IoIosShareAlt size={25} color={(sizeMode === sizeObj.smallScreen || sizeMode === sizeObj.extraSmallScreen)? 'white' : 'black'}/>
                            <span className='shareText'>{ numberFilter(reel.reelInfo.shares.count) !== '0' ? numberFilter(reel.reelInfo.shares.count) : 'Share' }</span>
                          </div>
                        )
                      }
                      {/* Share Icon */}

                    </div>
                    {/* Right Side Options */}

                    {/* Bottom Side */}
                    {
                      reel.bottomSection ? (
                        <div style={{ position: 'absolute', bottom: '0px' }}>
                          { reel.bottomSection.component }
                        </div>
                      ) : (
                    
                        <div className='bottomBar'>
                          { reel.reelInfo.description && (
                             <div>
                               <label>{ reel.reelInfo.description }</label>
                             </div>
                          )}
                          
                          {
                            reel.reelInfo.postedBy && (
                              <div onClick={() => handleAvatarClicked(reel)}>
                                <img 
                                  src={reel.reelInfo.postedBy.avatar} 
                                  alt={"profile-image"} 
                                />
                                <label>{ reel.reelInfo.postedBy.name }</label>
                              </div>
                            )
                          }
                        </div>

                      )
                    }
                    {/* Bottom Side */}
                    
                  </div>
                  {/* Wrapper of the video element */}

                </div>
                {/* Background of the Reels */}

          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default ReelsComponent