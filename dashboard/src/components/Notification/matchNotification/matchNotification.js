import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import MatchNotificationItem from "./matchNotificationItem";
import { NotificationContext } from "../../../createContext/Notification/NotificationContext";
import styles from "./matchNotification.module.css"; // Assuming the styles are here
import isAuth from "../../../createContext/is-Auth/IsAuthContext";

const Backend_URL = "http://localhost:5000";

const MatchNotification = () => {
  const { token } = useContext(isAuth);
  const { allMatches, loading, error, user } = useContext(NotificationContext);
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [creators, setCreators] = useState({});
  const [adminsArr, setAdminsArr] = useState({}); // State to store admin data
  const [loadingCreators, setLoadingCreators] = useState(false); // Loading state for creators
  const [loadingAdmins, setLoadingAdmins] = useState(false); // Loading state for admins

  useEffect(() => {
    if (user) {
      setIsUserLoading(false); // Stop the loading state when the user is available
    }
  }, [user]);

  // Fetch sports from the backend
  const fetchSports = async () => {
    try {
      setLoadingSports(true);
      const response = await axios.get(`${Backend_URL}/api/sport/`);
      setSports(response.data); // Assuming response is an array of sports
    } catch (err) {
      console.error(err);
      setSports([]);
    } finally {
      setLoadingSports(false);
    }
  };

  // Fetch creator data
  const fetchCreatorData = async (creatorId) => {
    try {
      const response = await axios.get(`${Backend_URL}/api/users/${creatorId}`, {
        headers: { token },
      });
      return response.data;
    } catch (err) {
      console.error("Error fetching creator data:", err);
      return null;
    }
  };

  // Fetch admin data
  const fetchAdminData = async (adminId) => {
    try {
      const response = await axios.get(`${Backend_URL}/api/users/${adminId}`, {
        headers: { token },
      });
      return response.data;
    } catch (err) {
      console.error("Error fetching admin data:", err);
      return null;
    }
  };

  // Fetch all creators and admins for the matches
  const fetchAllCreatorsAndAdmins = async () => {
    const creatorIds = [...new Set(allMatches.map((match) => match.creator))];
    const adminIds = [...new Set(allMatches.flatMap((match) => match.admins))];

    setLoadingCreators(true);
    setLoadingAdmins(true);

    const fetchedCreators = {};
    const fetchedAdmins = {};

    // Fetch creators
    for (const creatorId of creatorIds) {
      if (!creators[creatorId]) {
        const creatorData = await fetchCreatorData(creatorId);
        if (creatorData) {
          fetchedCreators[creatorId] = creatorData;
        }
      }
    }

    // Fetch admins
    for (const adminId of adminIds) {
      if (!adminsArr[adminId]) {
        const adminData = await fetchAdminData(adminId);
        if (adminData) {
          fetchedAdmins[adminId] = adminData;
        }
      }
    }

    setCreators((prev) => ({ ...prev, ...fetchedCreators }));
    setAdminsArr((prev) => ({ ...prev, ...fetchedAdmins }));

    setLoadingCreators(false);
    setLoadingAdmins(false);
  };

  useEffect(() => {
    if (allMatches && allMatches.length > 0) {
      fetchAllCreatorsAndAdmins();
    }
  }, [allMatches]);

  useEffect(() => {
    fetchSports();
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const differenceInMs = now - notificationTime;
    const differenceInMinutes = Math.floor(differenceInMs / 60000);

    if (differenceInMinutes < 1) {
      return "Just now";
    } else if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    } else if (differenceInMinutes < 1440) {
      const hours = notificationTime.getHours();
      const minutes = notificationTime.getMinutes();
      const period = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = String(minutes).padStart(2, "0");
      return `${formattedHours}:${formattedMinutes} ${period}`;
    } else {
      const day = notificationTime.getDate();
      const month = notificationTime.toLocaleString("default", { month: "short" });
      return `${day} ${month}`;
    }
  };

  const getSportName = (sportId) => {
    const sport = sports.find((sport) => sport._id === sportId);
    return sport ? sport.name : "Unknown Sport";
  };

  if (loading || loadingSports || isUserLoading || loadingCreators || loadingAdmins) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {allMatches && allMatches.length > 0 ? (
        allMatches.map((match, index) => {
          const {
            _id,
            date,
            location,
            sport,
            teams,
            players,
            isTeamMatch,
            name,
            status,
            admins,
            createdAt,
            creator,

          } = match;
          const creatorData = creators[creator]; // Get creator data from the state
          const sportName = getSportName(sport);
          const userRole = admins.includes(user?._id) ? "admin" : "player";
          const adminData1 = adminsArr[admins[0]] ? adminsArr[admins[0]] : null;
          const adminData2 = adminsArr[admins[1]] ? adminsArr[admins[1]] : null;
          
          let team1, team2, score1, score2, participants;       
          if (isTeamMatch) {
            team1 = teams?.[0]?.team || "Team 1";
            team2 = teams?.[1]?.team || "Team 2";
            score1 = teams?.[0]?.score || "N/A";
            score2 = teams?.[1]?.score || "N/A";
            participants = players || [];
          } else {
            team1 = null;
            team1 =null;
            score1 = "N/A";
            score2 = "N/A";
          }
          return (
            <div key={_id}>
              <MatchNotificationItem
                matchId={_id}
                location={location}
                date={new Date(date).toLocaleDateString()}
                time={new Date(date).toLocaleTimeString()}
                player1={adminData1?.name || "Admin 1"}
                player2={adminData2?.name || "Admin 2"}
                score1={score1}
                score2={score2}
                sportName={sportName}
                isTeamMatch={isTeamMatch}
                team1Id={team1}
                team2Id={team2}
                // participants={isTeamMatch ? participants : null}
                matchName={name}
                matchStatus={status}
                userRole={userRole}
                timestamp={formatTime(createdAt)}
                creatorAvatar={creatorData?.avatar || " "}
                creatorName={creatorData?.name || " "}
              />
              {index < allMatches.length - 1 && (
                <div className={styles.matchDivider} />
              )}
            </div>
          );
        })
      ) : (
        <div>No matches found</div>
      )}
    </div>
  );
};

export default MatchNotification;
