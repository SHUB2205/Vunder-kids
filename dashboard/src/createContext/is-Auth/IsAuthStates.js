import React, { useEffect, useState, useCallback } from "react";
import IsAuth from "./IsAuthContext";
import axios from "axios";

const Backend_URL = 'http://localhost:5000';

export default function IsAuthStates(props) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    // Memoize fetchUserInfo
    const fetchUserInfo = useCallback(async () => {
        try {
            const response = await axios.get(`${Backend_URL}/api/users/myInfo`, {
                headers: { token },
            });
            if (JSON.stringify(response.data) !== JSON.stringify(user)) {
                // Update user only if data has changed to avoid unnecessary renders
                setUser(response.data);
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    }, [token, user]);

    // On component mount or when token changes, fetch user info
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        if (token) {
            fetchUserInfo();
        }
    }, [token, fetchUserInfo]);

    // Watch for user changes and trigger actions if needed
    useEffect(() => {
    }, [user]);

    // Store token in sessionStorage when it's updated
    const setAuthToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            sessionStorage.setItem('token', newToken);
        } else {
            sessionStorage.removeItem('token');
        }
    };

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${Backend_URL}/api/users/myInfo`,{
          headers: { token }
        });
        setUser(response.data);
        console.log(user);
      }
      catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      }
    };
    
  return (
    <>
      <IsAuth.Provider value={{ token,setAuthToken,user }}>
        {props.children}
      </IsAuth.Provider>
    </>
  );

    return (
        <IsAuth.Provider value={{ token, setAuthToken, user ,fetchUserInfo}}>
            {props.children}
        </IsAuth.Provider>
    );

}
