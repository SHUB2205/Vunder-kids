import React, { useState, useEffect } from "react";
import styles from "./matchNotification.module.css";
import matchNoti from "../../images/matchNotiAvtar.png";
import matchTeamIcon1 from "../../images/TeamIcon1.png";
import matchTeamIcon2 from "../../images/TeamIcon2.png";
import RejectIcon from "../../images/rejectIcon.png";
import AcceptIcon from "../../images/acceptIcon.png";

const MatchNotificationItem = ({
  location,
  date,
  time,
  player1,
  player2,
  score1,
  score2,
  timestamp,
  isTeamMatch,
  participants,
  matchName,
  userRole, // 'admin' or 'player'
  matchStatus, // 'completed' or 'pending'
  sportName, // sport name fetched from the backend
}) => {
  const [showTeam1Participants, setShowTeam1Participants] = useState(false);
  const [showTeam2Participants, setShowTeam2Participants] = useState(false);
  //   console.log(sportName);
  return (
    <div className={styles.matchNotificationItem}>
      <div className={styles.matchHeader}>
        <img src={matchNoti} alt="Avatar" className={styles.avatar} />

        <div className={styles.matchDetails}>
          <div className={styles.matchTitle}>
            <div className={styles.type}>
              {isTeamMatch ? "Team Match" : "1-on-1 Match"}
            </div>
            <div className={styles.location}>{location},</div>
            <div className={styles.time}>
              {date}, {time}
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.matchName}>
              <strong>Match: {matchName}</strong> {/* Display the match name */}
            </div>

            <div className={styles.playerDetails}>
              <div className={styles.player}>
                <img
                  src={matchTeamIcon1}
                  alt={player1}
                  className={styles.playerAvatar}
                  onMouseEnter={() => setShowTeam1Participants(true)}
                  onMouseLeave={() => setShowTeam1Participants(false)}
                />
                <div>{player1}</div>
                {isTeamMatch && matchStatus === "completed" && (
                  <div>Score: {score1}</div>
                )}
                {showTeam1Participants && isTeamMatch && (
                  <div className={styles.tooltip}>
                    <h4>Team 1 Participants:</h4>
                    <ul>
                      {participants?.[0]?.participants &&
                      participants[0].participants.length > 0 ? (
                        participants[0].participants.map((participant, idx) => (
                          <li key={idx}>{participant}</li>
                        ))
                      ) : (
                        <li>No participants available</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.player}>
                <img
                  src={matchTeamIcon2}
                  alt={player2}
                  className={styles.playerAvatar}
                  onMouseEnter={() => setShowTeam2Participants(true)}
                  onMouseLeave={() => setShowTeam2Participants(false)}
                />
                <div>{player2}</div>
                {isTeamMatch && matchStatus === "completed" && (
                  <div>Score: {score2}</div>
                )}
                {showTeam2Participants && isTeamMatch && (
                  <div className={styles.tooltip}>
                    <h4>Team 2 Participants:</h4>
                    <ul>
                      {participants?.[1]?.participants &&
                      participants[1].participants.length > 0 ? (
                        participants[1].participants.map((participant, idx) => (
                          <li key={idx}>{participant}</li>
                        ))
                      ) : (
                        <li>No participants available</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {userRole === "admin" ? (
              <div className={styles.actions}>
                <button className={styles.acceptButton}>
                  <img src={AcceptIcon} alt="Accept" className={styles.icon} />{" "}
                  Accept
                </button>
                <button className={styles.rejectButton}>
                  <img src={RejectIcon} alt="Reject" className={styles.icon} />{" "}
                  Reject
                </button>
              </div>
            ) : (
              <div className={styles.matchStatus}>
                <strong>Status:</strong>{" "}
                {matchStatus === "completed" ? "Completed" : "Pending"}
              </div>
            )}

            <div className={styles.timestamp}>{timestamp}</div>
          </div>
          <div className={styles.sport}>{sportName}</div>{" "}
          {/* Display the sport name */}
        </div>
      </div>
    </div>
  );
};

export default MatchNotificationItem;
