import React, { useEffect, useState, useContext,useCallback } from "react";
import { ChatContext } from "./ChatContext";
import axios from "axios";
import IsAuth from "../is-Auth/IsAuthContext";
import io from "socket.io-client";
export default function ChatState(props) {
    const SERVER_URL = "http://localhost:4000";
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
          const response = await axios.get(`${SERVER_URL}/api/users/${id}`, {
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


//   socket wok
  const [activeChat, setActiveChat] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [chats, setChats] = useState({ users: [], groups: [] });
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const handleMessageClick = (user) => {

    setActiveChat({ type: "user", id: user.id, name: user.name })
    // console.log("clock on the handle"+activeChat);
    const rightContent = document.querySelector('.message-right-content');
    rightContent.classList.add('active');
  };


  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const newSocket = io(SERVER_URL, { query: { token } });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      // console.log("Socket ID:", newSocket.id); // Log the socket ID here
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Failed to connect to chat server. Please try again later.");
    });

 
    
    
    newSocket.on("new private message", handleNewMessage);
    newSocket.on("new group message", handleNewMessage);
    setSocket(newSocket);
    
    return () => newSocket.close();
    
  }, []);
  

  const handleNewMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  // fetching all the chat
  useEffect(() => {
    fetchChats();
  }, []);
  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/messages/chats`, {
        headers: {
          token: sessionStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
  
      // Process and log data directly
      const users = data.filter((chat) => chat.type === "user");
      const groups = data.filter((chat) => chat.type === "group");
      // console.log({ users, groups });
  
      // Update the state
      setChats({ users, groups });
      // console.log(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load chats. Please refresh the page.");
    }
  }, []);
  

  // fetching all the messages
  useEffect(() => {
    if (activeChat) {
      // console.log(activeChat);
      fetchMessages(activeChat.id, activeChat.type);
      if (socket) {
        socket.emit("join room", activeChat.id);
      }
    }
  
    return () => {
      if (socket && activeChat) {
        socket.emit("leave room", activeChat.id);
      }
    };
  }, [activeChat, socket]);
  

  const fetchMessages = async (chatId, chatType) => {
    try {
      const endpoint =
        chatType === "user"
          ? `${SERVER_URL}/api/messages/private/${chatId}`
          : `${SERVER_URL}/api/messages/group/${chatId}`;
      const response = await fetch(endpoint, {
        headers: {
          token: sessionStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      // console.log(data);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again.");
    }
  };

  // sending message
  const sendMessage = (content) => {
    if (!socket || !activeChat) return;

    const eventName =
      activeChat.type === "user" ? "private message" : "group message";
    const payload =
      activeChat.type === "user"
        ? { recipientId: activeChat.id, content }
        : { groupId: activeChat.id, content };
        // console.log(payload);
    socket.emit(eventName, payload, (response) => {
      if (response.error) {
        console.error("Error sending message:", response.error);
        setError("Failed to send message. Please try again.");
      }
    });
    setInputMessage('');
  };









  return (
    <ChatContext.Provider value={{ userInfo, loading, error, allMembers,token,activeChat,inputMessage, setInputMessage,chats,messages,handleMessageClick,sendMessage}}>
      {props.children}
    </ChatContext.Provider>
  );
}
