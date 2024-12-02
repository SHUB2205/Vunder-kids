import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "./NotificationContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import isAuth from "../is-Auth/IsAuthContext";

const Backend_URL = "http://localhost:5000";

const NotificationState = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { token } = useContext(isAuth);

  useEffect(() => {
    if (location.pathname === "/notification/all") {
      const fetchNotifications = async () => {
        setLoading(true);
        setError(null); // Clear any previous error
        try {
          const { data } = await axios.get(`${Backend_URL}/api/notifications/all`, {
            headers: {
              token,
            },
          });
          console.log(data.notifications);
          setAllNotifications(data.notifications);
        } catch (err) {
          console.error("Error fetching notifications:", err);
          setError("An error occurred please reload your page");
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [location, token]);

  return (
    <NotificationContext.Provider value={{ allNotifications, loading, error }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationState;
