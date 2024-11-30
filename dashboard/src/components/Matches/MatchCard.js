import React from 'react';
import styles from './MatchCard.module.css';

const MatchCard = ({matchData}) => {

  const formatDate = (isoDate) => {
    const options = {
      weekday: 'short', // Mon, Tue, etc.
      month: 'short',   // Sep, Oct, etc.
      day: 'numeric',   // 7, 29, etc.
      hour: 'numeric',  // 9, 10, etc.
      minute: 'numeric', // 30, 59, etc.
      hour12: true,     // AM/PM format
    };
  
    return new Intl.DateTimeFormat('en-US', options).format(new Date(isoDate));
  };

  const image_url_default = 'https://cdn.builder.io/api/v1/image/assets/TEMP/0ad91c78db796de1249db6649a8c84b9694b72c0270fc0ede8d8b96cefc04002?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c';

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <div className={styles.matchInfo}>
          <span>{matchData.isTeamMatch ? "Team" : "1 on 1"}</span>
          <span>Location: {matchData.location}</span>
          {/* <span>{matchInfo.venue}</span> */}
        </div>
        
      <div className={styles.predictLabel}>
        Predict
      </div>

      </div>
          <div className={styles.playerSection}>
          {matchData.isTeamMatch ?  (
              <>
                <img src={image_url_default} alt={matchData.teams[0].team.name} className={styles.playerImage} />
                <span>{matchData.teams[0].team.name}</span>
              </>) :
            (<>
              <img src={matchData.players[0].avatar} alt={matchData.players[0].name} className={styles.playerImage} />
              <span>{matchData.players[0].name}</span>
            </>)}
            <div className={styles.predictionBar}>
              <div className={styles.checkbox} />
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${0}%` }}
                />
              </div>
              <span className={styles.predictionText}>{0}%</span>
            </div>
          </div>
          <div className={styles.playerSection}>
            {matchData.isTeamMatch ?  (
              <>
                <img src={image_url_default} alt={matchData.teams[1].team.name} className={styles.playerImage} />
                <span>{matchData.teams[1].team.name}</span>
              </>) :
            (<>
              <img src={matchData.players[1].avatar} alt={matchData.players[1].name} className={styles.playerImage} />
              <span>{matchData.players[1].name}</span>
            </>)}
            <div className={styles.predictionBar}>
              <div className={styles.checkbox} />
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${0}%` }}
                />
              </div>
              <span className={styles.predictionText}>{0}%</span>
            </div>
          </div>
          <div className={styles.voteInfo}>{'67 votes | 64 h 23 m left'}</div>
      
      <div className={styles.matchFooter}>
        <div className={styles.matchDetails}>
        <span className={styles.sportType}>{matchData.sport.name.charAt(0).toUpperCase() + matchData.sport.name.slice(1)},</span>
          <span>{<span>{formatDate(matchData.date)}</span>}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;