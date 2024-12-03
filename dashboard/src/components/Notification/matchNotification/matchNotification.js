import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import MatchNotificationItem from "./matchNotificationItem";
import { NotificationContext } from "../../../createContext/Notification/NotificationContext";

const Backend_URL = "http://localhost:5000";

const MatchNotification = () => {
  const { allMatches, loading, error, user } = useContext(NotificationContext);
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Simulate fetching user data if it isn't loaded yet
  useEffect(() => {
    if (user) {
      setIsUserLoading(false); // Stop the loading state when the user is available
    }
  }, [user]);

  // Fetch sports from the backend when the component mounts
  const fetchSports = async () => {
    try {
      setLoadingSports(true);
      const response = await axios.get(`${Backend_URL}/api/sport/`);
      setSports(response.data); // Assuming response is an array of sports
    } catch (err) {
      console.log(err);
      setSports([]);
    } finally {
      setLoadingSports(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  if (loading || loadingSports || isUserLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Find sport name by ID
  const getSportName = (sportId) => {
    const sport = sports.find((sport) => sport._id === sportId);
    return sport ? sport.name : "Unknown Sport";
  };

  return (
    <div>   
      {allMatches && allMatches.length > 0 ? (
        allMatches.map((match, index) => {
          const {
            _id,
            date,
            location,
            sport, // sport ID
            teams,
            players,
            isTeamMatch,
            timestamp,
            name, // match name
            status,
            admins,
          } = match;

          let player1, player2, score1, score2, participants;

          if (isTeamMatch) {
            // Team match details
            player1 = teams?.[0]?.team || "Team 1";
            player2 = teams?.[1]?.team || "Team 2";
            score1 = teams?.[0]?.score || "N/A";
            score2 = teams?.[1]?.score || "N/A";
            participants = players || [];
          } else {
            // 1-on-1 match details
            player1 = players?.[0] || "Player 1";
            player2 = players?.[1] || "Player 2";
            score1 = "N/A"; // No scores for 1-on-1 matches
            score2 = "N/A";
          }

          const sportName = getSportName(sport); // Get the sport name
        //   admins.forEach(admin => {
        //     if(admin==user?._id){
        //         console.log("true");
        //     }else{
        //         console.log("false");
        //     }
        //   });
        const userRole = admins.includes(user?._id) ? "admin" : "player";

          return (
            <MatchNotificationItem
              key={_id}
              location={location}
              date={new Date(date).toLocaleDateString()}
              time={new Date(date).toLocaleTimeString()}
              player1={player1}
              player2={player2}
              score1={score1}
              score2={score2}
              sportName={sportName} // Pass sport name
              timestamp={timestamp}
              isTeamMatch={isTeamMatch}
              participants={isTeamMatch ? participants : null}
              matchName={name} // Passing match name as prop
              matchStatus={status}
              userRole={userRole}
            />
          );
        })
      ) : (
        <div>No matches found</div>
      )}
    </div>
  );
};

export default MatchNotification;
