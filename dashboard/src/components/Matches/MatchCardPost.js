import React, { useContext, useEffect, useState } from 'react';
import styles from './MatchCardPost.module.css';
import MatchCard from './MatchCard';
import { MatchContext } from '../../createContext/Match/MatchContext';
import IsAuth from '../../createContext/is-Auth/IsAuthContext';
import { Heart, MessageCircle } from 'lucide-react';

const MatchCardPost = ({ matchData , openComment}) => {
  // If no matchData is provided, use default data
  const{toggleLike} = useContext(MatchContext);
  const defaultMatchData = {
    type: '1 on 1',
    location: 'Jacksonville',
    venue: 'TIAA Bank Field',
    player1: { 
      name: 'Tyler', 
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/0ad91c78db796de1249db6649a8c84b9694b72c0270fc0ede8d8b96cefc04002?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c',
      prediction: 0
    },
    player2: { 
      name: 'Ryan', 
      image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/0ad91c78db796de1249db6649a8c84b9694b72c0270fc0ede8d8b96cefc04002?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c',
      prediction: 0
    },
    sport: 'Football',
    date: 'Mon, Sep 7, 9:30 AM',
    votes: '67 votes | 64 h 23 m left'
  };

  const [isLiked,setLiked] = useState(false);
  const [currLikes , setCurrLikes] = useState(matchData?.likes?.length);
  
  
  const handleLike = async() => {
    const res = await toggleLike(matchData?._id);
    setCurrLikes(isLiked ? currLikes - 1 : currLikes + 1);
    setLiked(!isLiked);
  };
  
  const {user} = useContext(IsAuth);
  useEffect(() => {
    if (matchData?.likes && matchData.likes.includes(user?._id)){
      setLiked(true);
    }
  },[user])

  const matchInfo = matchData ? {
    type: matchData.isTeamMatch ? 'Team' : '1 on 1',
    location: matchData.location,
    venue: matchData.venue || 'Unknown Venue',
    player1: matchData.players && matchData.players[0] ? {
      name: matchData.players[0].userName,
      image: matchData.players[0].avatar,
      prediction: 0
    } : defaultMatchData.player1,
    player2: matchData.players && matchData.players[1] ? {
      name: matchData.players[1].userName,
      image: matchData.players[1].avatar,
      prediction: 0
    } : { name: '?', image: defaultMatchData.player2.image, prediction: 0 },
    sport: matchData.sport?.name || 'Unknown Sport',
    date: new Date(matchData.date).toLocaleString(),
    votes: '0 votes | Upcoming'
  } : defaultMatchData;

  return (
    <article className={styles.matchCardPost}>
      <header className={styles.postHeader}>
        <img 
          src={matchInfo.player1.image} 
          alt="User avatar" 
          className={styles.userAvatar} 
        />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{matchInfo.player1.name}</h3>
          <time className={styles.postTime}>Upcoming Match</time>
        </div>
      </header>
      <p className={styles.postContent}>
        {matchInfo.player1.name} vs {matchInfo.player2.name} in an exciting {matchInfo.sport} match!
      </p>
      <MatchCard matchData={matchData}/>
      <footer className={styles.postFooter}>
        <div className={styles.likeSection}>
          <button aria-label="Like" className={styles.actionButton} onClick={handleLike}>
              {isLiked ? <Heart fill='#FA2A55' color='#FA2A55'/> : <Heart/>}
          </button>
          <button aria-label="Comment" className={styles.actionButton} onClick={() => {openComment(matchData)}} >
              <MessageCircle />
          </button>
          <button aria-label="Share"   className={styles.actionButton}>
            <svg width={25} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="share"><path fill="#000000" d="m21.707 11.293-8-8A1 1 0 0 0 12 4v3.545A11.015 11.015 0 0 0 2 18.5V20a1 1 0 0 0 1.784.62 11.456 11.456 0 0 1 7.887-4.049c.05-.006.175-.016.329-.026V20a1 1 0 0 0 1.707.707l8-8a1 1 0 0 0 0-1.414ZM14 17.586V15.5a1 1 0 0 0-1-1c-.255 0-1.296.05-1.562.085a14.005 14.005 0 0 0-7.386 2.948A9.013 9.013 0 0 1 13 9.5a1 1 0 0 0 1-1V6.414L19.586 12Z"></path></svg>
            </button>
        </div>
        <p className={styles.likesCount}>{currLikes ? currLikes : 0} likes</p>
        <button className={styles.viewComments}>View all comments</button>
      </footer>
    </article>
  );
};

export default MatchCardPost;