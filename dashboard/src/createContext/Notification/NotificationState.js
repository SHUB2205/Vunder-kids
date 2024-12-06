import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "./NotificationContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import isAuth from "../is-Auth/IsAuthContext";

const Backend_URL = process.env.REACT_APP_BACKEND_URL;

const NotificationState = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { token, user } = useContext(isAuth);

  useEffect(() => {
    if (location.pathname === "/notification/all") {
      const fetchNotifications = async () => {
        setLoading(true);
        setError(null); // Clear any previous error
        try {
          const { data } = await axios.get(
            `${Backend_URL}/api/notifications/all`,
            {
              headers: {
                token,
              },
            }
          );
          // console.log(data.notifications);
          setAllNotifications(data.notifications);
        } catch (err) {
          console.error("Error fetching notifications:", err);
          setError("An error occurred, please reload your page");
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }

    if (location.pathname === "/notification/matches") {
      const fetchMatches = async () => {
        setLoading(true);
        setError(null); // Clear any previous error
        try {
          const { data } = await axios.get(
            `${Backend_URL}/api/notifications/matches`,
            {
              headers: {
                token,
              },
            }
          );

          const filteredMatches = data.matches.filter((match) => {
            // Exclude matches created by the user only if the status is "in-progress"
            if (match.creator === user._id && match.status === "in-progress") {
              return false; // Don't include this match
            }
          
            // Include all other matches
            return true; 
          });
          // console.log(filteredMatches);
          setAllMatches(filteredMatches);
        } catch (err) {
          console.error("Error fetching matches:", err);
          setError("An error occurred, please reload your page");
        } finally {
          setLoading(false);
        }
      };

      fetchMatches();
    }
  }, [location, token]);

  return (
    <NotificationContext.Provider
      value={{
        allNotifications,
        allMatches,
        loading,
        error,
        user,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationState;
