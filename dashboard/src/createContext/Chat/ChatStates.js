import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "./ChatContext";
import axios from "axios";
import IsAuth from "../is-Auth/IsAuthContext";

const Backend_URL = 'http://localhost:5000';

export default function ChatState(props) {
  const { token, fetchUserInfo, user } = useContext(IsAuth); // Get fetchUserInfo and user from context
  const [userInfo, setUserInfo] = useState(null); // State to store user info
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState(null); // State to track errors

  // Refetch user info every time the component mounts or when the token changes
  useEffect(() => {
    if (token) {
      setLoading(true); // Set loading to true while fetching data
      fetchUserInfo(); // Call fetchUserInfo to get the latest user data
    }
  }, [token, fetchUserInfo]); // Trigger this effect when the token changes

  useEffect(() => {
    if (user) {
      setUserInfo(user); // Set the user info once it is fetched
      console.log("here"+ user.name + user._id);
      setLoading(false); // Set loading to false after the user info is available
    }
  }, [user]); // This effect depends on the user state
  const allMembers = async () => {
    if (!userInfo) return { uniqueIds: [], uniqueUsernames: [], userNames: [] };
    console.log("sender Id",userInfo._id);
    const { followers, following } = userInfo;
    // Combine and remove duplicates
    const combined = [...followers, ...following];
    const uniqueIds = Array.from(new Set(combined));
  
    // Fetch usernames and names for unique IDs
    const userInfoDetails = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const response = await axios.get(`${Backend_URL}/api/users/${id}`, {
            headers: {
              "Content-Type": "application/json", // Include Content-Type header
              "token": token, // Include token from localStorage
            },
          });
  
          // Assuming the API returns `userName` and `name`
          return {
            userName: response.data.userName, // The `userName` field
            name: response.data.name,         // The `name` field
          };
        } catch (error) {
          console.error(`Error fetching data for ID ${id}:`, error);
          return { userName: "Unknown User", name: "Unknown" }; // Fallback if the request fails
        }
      })
    );
  
    // Extract user names and names from the result
    const userNames = userInfoDetails.map((info) => info.userName);
    const names = userInfoDetails.map((info) => info.name);
  
    // console.log(uniqueIds, userNames, names);
    return { uniqueIds, userNames, names };
  };
  

  return (
    <ChatContext.Provider value={{ userInfo, loading, error, allMembers,token }}>
      {props.children}
    </ChatContext.Provider>
  );
}
