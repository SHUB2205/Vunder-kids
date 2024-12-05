import React, { useContext, useState, useEffect } from 'react';
import styles from './MatchCard.module.css';
import IsAuth from '../../createContext/is-Auth/IsAuthContext';
import { MatchContext } from '../../createContext/Match/MatchContext';

const MatchCard = ({matchData, onVoteUpdate}) => {
  const {user} = useContext(IsAuth);
  const {vote} = useContext(MatchContext);
  const [localMatchData, setLocalMatchData] = useState(matchData);
  const [userVote, setUserVote] = useState(null);
  const [isVotingDisabled, setIsVotingDisabled] = useState(false);

  useEffect(() => {
    // Check if match date has passed
    const matchDate = new Date(matchData.date);
    const today = new Date();
    setIsVotingDisabled(today > matchDate);

    // Determine user's current vote
    if (matchData.predictions.option1.includes(user?._id)) {
      setUserVote('option1');
    } else if (matchData.predictions.option2.includes(user?._id)) {
      setUserVote('option2');
    }

    // Update local match data
    setLocalMatchData(matchData);
  }, [matchData, user]);

  const handleVote = async (optionNumber) => {
    if (isVotingDisabled) return;

    try {
      // If clicking on already selected option, unselect
      if (userVote === optionNumber) {
        await vote(localMatchData._id, 0);
        setUserVote(null);
        
        // Remove user from the selected option
        const updatedPredictions = {...localMatchData.predictions};
        updatedPredictions[optionNumber] = updatedPredictions[optionNumber].filter(
          id => id.toString() !== user._id
        );
        
        setLocalMatchData(prev => ({
          ...prev,
          predictions: updatedPredictions
        }));

        // Callback to parent component if needed
        onVoteUpdate && onVoteUpdate(updatedPredictions);
        return;
      }

      // Vote for a new option
      await vote(localMatchData._id, optionNumber === 'option1' ? 1 : 2);
      setUserVote(optionNumber);

      // Update local match data
      const updatedPredictions = {...localMatchData.predictions};
      
      // Remove user from other option if exists
      const otherOption = optionNumber === 'option1' ? 'option2' : 'option1';
      updatedPredictions[otherOption] = updatedPredictions[otherOption].filter(
        id => id.toString() !== user._id
      );

      // Add user to selected option
      if (!updatedPredictions[optionNumber].some(id => id.toString() === user._id)) {
        updatedPredictions[optionNumber].push(user._id);
      }

      setLocalMatchData(prev => ({
        ...prev,
        predictions: updatedPredictions
      }));

      // Callback to parent component if needed
      onVoteUpdate && onVoteUpdate(updatedPredictions);

    } catch (error) {
      console.error('Voting failed', error);
    }
  };

  const formatDate = (isoDate) => {
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
  
    return new Intl.DateTimeFormat('en-US', options).format(new Date(isoDate));
  };

  const image_url_default = 'https://cdn.builder.io/api/v1/image/assets/TEMP/0ad91c78db796de1249db6649a8c84b9694b72c0270fc0ede8d8b96cefc04002?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c';

  const calculatePredictionPercentage = (option) => {
    const totalVotes = localMatchData.predictions.option1.length + localMatchData.predictions.option2.length;
    return totalVotes > 0 
      ? (localMatchData.predictions[option].length * 100 / totalVotes).toFixed(0) 
      : 0;
  };

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <div className={styles.matchInfo}>
          <span>{localMatchData.isTeamMatch ? "Team" : "1 on 1"}</span>
          <span>Location: {localMatchData.location}</span>
        </div>
        
        <div className={styles.predictLabel}>
          Predict
        </div>
      </div>

      {/* First Participant Section */}
      <div className={styles.playerSection}>
        {localMatchData.isTeamMatch ? (
          <>
            <img src={image_url_default} alt={localMatchData.teams[0].team.name} className={styles.playerImage} />
            <span>{localMatchData.teams[0].team.name}</span>
          </>
        ) : (
          <>
            <img src={localMatchData.players[0].avatar} alt={localMatchData.players[0].name} className={styles.playerImage} />
            <span>{localMatchData.players[0].name}</span>
          </>
        )}
        <div className={styles.predictionBar}>
          <div 
            className={`${styles.checkbox} ${
              isVotingDisabled 
                ? (userVote === 'option1' ? styles.selectedDisableCheckbox :styles.disabledCheckbox )
                : userVote === 'option1' 
                  ? styles.selectedCheckbox 
                  : ''
            }`} 
            onClick={() => handleVote('option1')}
          />
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${calculatePredictionPercentage('option1')}%` }}
            />
          </div>
          <span className={styles.predictionText}>
            {calculatePredictionPercentage('option1')}%
          </span>
        </div>
      </div>

      {/* Second Participant Section */}
      <div className={styles.playerSection}>
        {localMatchData.isTeamMatch ? (
          <>
            <img src={image_url_default} alt={localMatchData.teams[1].team.name} className={styles.playerImage} />
            <span>{localMatchData.teams[1].team.name}</span>
          </>
        ) : (
          <>
            <img src={localMatchData.players[1].avatar} alt={localMatchData.players[1].name} className={styles.playerImage} />
            <span>{localMatchData.players[1].name}</span>
          </>
        )}
        <div className={styles.predictionBar}>
          <div 
            className={`${styles.checkbox} ${
              isVotingDisabled 
                ? (userVote === 'option2' ? styles.selectedDisableCheckbox :styles.disabledCheckbox )
                : userVote === 'option2' 
                  ? styles.selectedCheckbox 
                  : ''
            }`} 
            onClick={() => handleVote('option2')}
          />
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${calculatePredictionPercentage('option2')}%` }}
            />
          </div>
          <span className={styles.predictionText}>
            {calculatePredictionPercentage('option2')}%
          </span>
        </div>
      </div>

      <div className={styles.voteInfo}>
        {`${localMatchData.predictions.option1.length + localMatchData.predictions.option2.length} votes | ${calculateTimeLeft(localMatchData.date)}`}
      </div>
      
      <div className={styles.matchFooter}>
        <div className={styles.matchDetails}>
          <span className={styles.sportType}>
            {localMatchData.sport.name.charAt(0).toUpperCase() + localMatchData.sport.name.slice(1)},
          </span>
          <span>{formatDate(localMatchData.date)}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate time left
const calculateTimeLeft = (matchDate) => {
  const now = new Date();
  const match = new Date(matchDate);
  const diff = match - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} d ${hours} h ${minutes} m left`;
};

export default MatchCard;