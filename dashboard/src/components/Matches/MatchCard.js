import React from 'react';
import styles from './MatchCard.module.css';

const MatchCard = ({ isSimplified = false }) => {
  const matchInfo = {
    type: '1 on 1',
    location: 'Jacksonville,',
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

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <div className={styles.matchInfo}>
          <span>{matchInfo.type}</span>
          <span>{matchInfo.location}</span>
          <span>{matchInfo.venue}</span>
        </div>
        {!isSimplified && (
          <div className={styles.predictLabel}>
            Predict
          </div>
        )}
      </div>
      {!isSimplified && (
        <>
          <div className={styles.playerSection}>
            <img src={matchInfo.player1.image} alt={matchInfo.player1.name} className={styles.playerImage} />
            <span>{matchInfo.player1.name}</span>
            <div className={styles.predictionBar}>
              <div className={styles.checkbox} />
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${matchInfo.player1.prediction}%` }}
                />
              </div>
              <span className={styles.predictionText}>{matchInfo.player1.prediction}%</span>
            </div>
          </div>
          <div className={styles.playerSection}>
            <img src={matchInfo.player2.image} alt={matchInfo.player2.name} className={styles.playerImage} />
            <span>{matchInfo.player2.name}</span>
            <div className={styles.predictionBar}>
              <div className={styles.checkbox} />
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${matchInfo.player2.prediction}%` }}
                />
              </div>
              <span className={styles.predictionText}>{matchInfo.player2.prediction}%</span>
            </div>
          </div>
          <div className={styles.voteInfo}>{matchInfo.votes}</div>
        </>
      )}
      {isSimplified && (
        <>
          <div className={styles.playerSimple}>
            <img src={matchInfo.player1.image} alt={matchInfo.player1.name} className={styles.playerImage} />
            <span>{matchInfo.player1.name}</span>
          </div>
          <div className={styles.playerSimple}>
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/1133a3250d3011fc0b6d38c5871c465cdaf6f2f3b44e12b7edb26dce2817b24b?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" alt="Unknown player" className={styles.playerImage} />
            <span>?</span>
          </div>
        </>
      )}
      <div className={styles.matchFooter}>
        <div className={styles.matchDetails}>
          <span className={styles.sportType}>{matchInfo.sport},</span>
          <span>{matchInfo.date}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;