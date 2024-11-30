import React, { useEffect } from 'react';
import styles from './MatchCardPost.module.css';
import MatchCard from './MatchCard';

const MatchCardPost = ({ matchData}) => {
  // If no matchData is provided, use default data
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
  
  useEffect(()=>{console.log(matchData)},[])

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
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/117bd578dcfa4c17a57e9971de0ee9972e403a4e6408580c975d97bd40502299?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" 
            alt="Like icons" 
            className={styles.likeIcons} 
          />
        </div>
        <p className={styles.likesCount}>0 likes</p>
        <button className={styles.viewComments}>View all comments</button>
      </footer>
    </article>
  );
};

export default MatchCardPost;