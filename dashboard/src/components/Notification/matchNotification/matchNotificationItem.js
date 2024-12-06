import React, { useState, useContext } from "react";
import axios from "axios";
import styles from "./matchNotification.module.css";
import matchNoti from "../../images/matchNotiAvtar.png";
import matchTeamIcon1 from "../../images/TeamIcon1.png";
import matchTeamIcon2 from "../../images/TeamIcon2.png";
import RejectIcon from "../../images/rejectIcon.png";
import AcceptIcon from "../../images/acceptIcon.png";
import IsAuth from "../../../createContext/is-Auth/IsAuthContext";
import { MatchContext } from "../../../createContext/Match/MatchContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EyeIcon from "../../images/eye.png";
const Backend_URL = process.env.REACT_APP_BACKEND_URL;
const MatchNotificationItem = ({
  matchId,
  location,
  date,
  time,
  player1,
  player2,
  score1,
  score2,
  timestamp,
  isTeamMatch,
  matchName,
  userRole, // 'admin' or 'player'
  matchStatus, // 'completed' or 'pending'
  sportName, // sport name fetched from the backend
  creatorAvatar,
  creatorName, // Add the creator's name as a prop
  team1Id, // Team 1 ID
  team2Id, // Team 2 ID
}) => {
  const [showCreatorName, setShowCreatorName] = useState(false); // State for hovering on creator's avatar
  const [showTeam1Participants, setShowTeam1Participants] = useState(false);
  const [showTeam2Participants, setShowTeam2Participants] = useState(false);
  const [team1Participants, setTeam1Participants] = useState([]);
  const [team2Participants, setTeam2Participants] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const { token } = useContext(IsAuth);
  const { updateAggrement, error, loading } = useContext(MatchContext);
  const fetchParticipants = async (teamId, setParticipants) => {
    try {
      console.log(isTeamMatch);

      // Step 1: Fetch team details
      console.log(teamId);
      const teamResponse = await axios.get(
        `${Backend_URL}/api/teams/${teamId}`,
        {
          headers: {
            token, // Pass the token in the Authorization header
          },
        }
      );
      //   console.log(teamResponse.data);

      const participantIds = teamResponse.data.participants || [];
      //   console.log(participantIds);

      // Step 2: Fetch participant details
      const participantResponses = await Promise.all(
        participantIds.map((id) =>
          axios.get(`${Backend_URL}/api/users/${id}`, {
            headers: {
              token, // Pass the token here as well
            },
          })
        )
      );

      // Map participant data to names
      const participantsData = participantResponses.map((res) => res.data.name);
      setParticipants(participantsData);
    } catch (error) {
      console.error(`Error fetching participants for team ${teamId}:`, error);
    }
  };

  const [currentAction, setCurrentAction] = useState(null); // Track ongoing action
  const [finalAction, setFinalAction] = useState(null); // Track the final action (accepted/rejected)

  const handleAgreementAction = async (action) => {
    if (finalAction) return; // Prevent further action if already accepted/rejected

    setCurrentAction(action); // Indicate loading for the action
    try {
      await updateAggrement(action, matchId);
      setFinalAction(action); // Save the final action
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    } finally {
      setCurrentAction(null); // Reset loading state
    }
  };

  return (
    <>
      <div className={styles.matchNotificationItem}>
        <div className={styles.matchHeader}>
          <div
            className={styles.creatorAvatarContainer}
            onMouseEnter={() => setShowCreatorName(true)}
            onMouseLeave={() => setShowCreatorName(false)}
          >
            <img
              src={creatorAvatar || matchNoti}
              alt="Avatar"
              className={styles.outsideAvatar}
            />
            {showCreatorName && (
              <div className={styles.creatorNameTooltip}>{creatorName}</div>
            )}
          </div>

          <div className={styles.matchDetails}>
            <div className={styles.matchTitle}>
              <img
                src={creatorAvatar || matchNoti}
                alt="Avatar"
                className={styles.avatar}
              />
              <div className={styles.matchName}>
                <strong>
                  {matchName.charAt(0).toUpperCase() + matchName.slice(1)}
                </strong>
              </div>
              <div className={styles.time}>
                {new Date(date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}{" "}
                ,{" "}
                {new Date(`${date} ${time}`).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
              <div className={styles.location}>
                , {location.charAt(0).toUpperCase() + location.slice(1)}
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.playerDetails}>
                <div className={styles.player}>
                  <img
                    src={matchTeamIcon1}
                    alt={player1}
                    className={styles.playerAvatar}
                  />
                  <div>{player1}</div>
                  {isTeamMatch && (
                    <img
                      src={EyeIcon}
                      alt="View Participants"
                      className={styles.eyeIcon}
                      onMouseEnter={() => {
                        if (isTeamMatch) {
                          setShowPlayers(true); // Show participants when hovering over eye icon
                          setShowTeam1Participants(true);
                          if (!team1Participants.length) {
                            fetchParticipants(team1Id, setTeam1Participants); // Fetch participants if not already fetched
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        setShowPlayers(false); // Hide participants when mouse leaves
                        setShowTeam1Participants(false);
                      }}
                    />
                  )}
                  {matchStatus === "completed" && <div>Score: {score1}</div>}
                  {showPlayers && showTeam1Participants && isTeamMatch && (
                    <div className={styles.tooltip}>
                      <h4>Team 1 Participants:</h4>
                      <ul>
                        {team1Participants.length ? (
                          team1Participants.map((participant, idx) => (
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
                  />
                  <div>{player2}</div>
                  {isTeamMatch && (
                    <img
                      src={EyeIcon}
                      alt="View Participants"
                      className={styles.eyeIcon}
                      onMouseEnter={() => {
                        if (isTeamMatch) {
                          setShowPlayers(true); // Show participants when hovering over eye icon
                          setShowTeam2Participants(true);
                          if (!team2Participants.length) {
                            fetchParticipants(team2Id, setTeam2Participants); // Fetch participants if not already fetched
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        setShowPlayers(false); // Hide participants when mouse leaves
                        setShowTeam2Participants(false);
                      }}
                    />
                  )}
                  {matchStatus === "completed" && <div>Score: {score2}</div>}
                  {showPlayers && showTeam2Participants && isTeamMatch && (
                    <div className={styles.tooltip}>
                      <h4>Team 2 Participants:</h4>
                      <ul>
                        {team2Participants.length ? (
                          team2Participants.map((participant, idx) => (
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
                  {matchStatus === "cancelled" ? (
                    <span>Cancelled</span> // Show "Cancelled" if match is cancelled
                  ) : matchStatus === "scheduled" ? (
                    <span>Scheduled</span> // Show "Scheduled" if match is accepted
                  ) : (
                    <>
                      <button
                        className={styles.acceptButton}
                        onClick={() => handleAgreementAction("accept")}
                        disabled={!!finalAction || currentAction === "accept"} // Disable if action is taken
                      >
                        {finalAction === "accept" ? (
                          <span>Accepted</span> // Show "Accepted" if final action was accept
                        ) : currentAction === "accept" ? (
                          <span>Accepting...</span> // Show "Accepting..." if loading
                        ) : (
                          <>
                            <img
                              src={AcceptIcon}
                              alt="Accept"
                              className={styles.icon}
                            />{" "}
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        className={styles.rejectButton}
                        onClick={() => handleAgreementAction("reject")}
                        disabled={!!finalAction || currentAction === "reject"} // Disable if action is taken
                      >
                        {finalAction === "reject" ? (
                          <span>Rejected</span> // Show "Rejected" if final action was reject
                        ) : currentAction === "reject" ? (
                          <span>Rejecting...</span> // Show "Rejecting..." if loading
                        ) : (
                          <>
                            <img
                              src={RejectIcon}
                              alt="Reject"
                              className={styles.icon}
                            />{" "}
                            Reject
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.matchStatus}>
                <strong>Status:</strong>{" "}
                {matchStatus === "completed" && <span>Completed</span>}
                {matchStatus === "scheduled" && <span>Scheduled</span>}
                {matchStatus === "cancelled" && <span>Cancelled</span>}
                {matchStatus === "in-progress" && <span>Pending</span>}
                {matchStatus !== "completed" &&
                  matchStatus !== "scheduled" &&
                  matchStatus !== "cancelled" &&
                  matchStatus !== "in-progress" && <span>Pending</span>}
              </div>
              )}
            </div>
            <div className={styles.belowCard}>
              <div className={styles.sport}>{sportName}</div>{" "}
              <div className={styles.timestamp}>{timestamp}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/* Other components */}
        <ToastContainer />
      </div>
    </>
  );
};

export default MatchNotificationItem;
