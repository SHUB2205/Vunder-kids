import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { ChatContext } from "./ChatContext";
import axios from "axios";
import IsAuth from "../is-Auth/IsAuthContext";
import io from "socket.io-client";
export default function ChatState(props) {
  const Chat_Url = "http://localhost:4000";
  const Backend_URL = "http://localhost:5000";

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
      // console.log("here"+ user.name + user._id);
      setLoading(false); // Set loading to false after the user info is available
    }
  }, [user]); // This effect depends on the user state
  const fetchAllMembers = async () => {
    if (!userInfo) return [];
    const { followers, following } = userInfo;

    // Combine followers and following, remove duplicates
    const uniqueIds = Array.from(new Set([...followers, ...following]));

    // Fetch details for unique IDs
    const userInfoDetails = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const response = await axios.get(`${Backend_URL}/api/users/${id}`, {
            headers: {
              "Content-Type": "application/json",
              token: token,
            },
          });
          return {
            id: id,
            userName: response.data.userName || "Unknown User",
            name: response.data.name || "Unknown",
          };
        } catch (error) {
          console.error(`Error fetching data for ID ${id}:`, error);
          return { id: id, userName: "Unknown User", name: "Unknown" };
        }
      })
    );

    return userInfoDetails;
  };

  //   socket wok
  const [activeChat, setActiveChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [chats, setChats] = useState({ users: [], groups: [] });
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [unseenCounts, setUnseenCounts] = useState([]); // State for unseen counts

  useEffect(() => {
    // console.log("Active chat updated:", JSON.stringify(activeChat));
  }, [activeChat]);

  const handleMessageClick = async (user) => {
    // console.log("user after clicked "+user.id+  " " + user.name)  ;
    const tempActiceChat = activeChat;
    // console.log("Active chat details: ", JSON.stringify(tempActiceChat));
    setActiveChat({
      type: "user",
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    });
    // console.log(activeChat);
    // console.log("changed");
    const type = "user";
    //  making the chat seen and updating the last seen time
    try {
      const response = await axios.post(
        `${Chat_Url}/api/messages/markMessagesAsSeen/${user.id}`, // The endpoint
        { type }, // Request body
        {
          headers: {
            token: token,
          },
        }
      );

      // console.log('Messages marked as seen:', response.data);
    } catch (error) {
      console.error(
        "Error marking messages as seen:",
        error.response?.data || error.message
      );
    }
    setUnseenCounts((prev) => {
      if (!Array.isArray(prev)) {
        console.error("unseenCounts is not an array:", prev);
        return [];
      }

      // Update the unseen count for this chatId
      return prev.map((item) =>
        item.chatId === user.id ? { ...item, unseenCount: 0 } : item
      );
    });
    const rightContent = document.querySelector(".message-right-content");
    rightContent.classList.add("active");
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const newSocket = io(Chat_Url, { query: { token } });

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

  const incrementUnseenCount = (chatId) => {
    setUnseenCounts((prev) => {
      const existing = prev.find((item) => item.chatId === chatId);
      if (existing) {
        return prev.map((item) =>
          item.chatId === chatId
            ? { ...item, unseenCount: item.unseenCount + 1 }
            : item
        );
      } else {
        return [...prev, { chatId, unseenCount: 1 }];
      }
    });
  };

  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const handleNewMessage = useCallback(
    (message) => {
      const currentActiveChat = activeChatRef.current; // Use ref for the latest value
      if (!currentActiveChat) {
        // console.log("No active chat selected.");
        return;
      }

      // console.log("Active chat ID:", currentActiveChat.id);
      // console.log("Message sender ID:", message.sender);
      // console.log("Received message:", message);

      if (
        (currentActiveChat.type === "user" &&
          currentActiveChat.id === message.sender) ||
        (currentActiveChat.type === "group" &&
          currentActiveChat.id === message.groupId)
      ) {
        // console.log("Message belongs to active chat.");
        setMessages((prevMessages) => [...prevMessages, message]);

        // console.log("Before update, chats:", chats);
        setChats((prevChats) => {
          // console.log("Previous chats state:", prevChats);
        
          const updatedUsers = (prevChats.users || []).map((user) => {
            if (user.id === currentActiveChat.id) {
              return {
                ...user,
                lastMessage: message.content,
                timestamp: new Date().toISOString(),
              };
            }
            return user;
          });
        
          const updatedChats = { ...prevChats, users: updatedUsers };
          console.log("Updated chats state:", updatedChats);
          return updatedChats;
        });
        
      } else {
        incrementUnseenCount(message.sender);
        // console.log("Message does not belong to the active chat.");
      }
    },
    [] // No need for activeChat dependency
  );

  // fetching all the chat
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(`${Chat_Url}/api/messages/chats`, {
        headers: {
          token: sessionStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();

      // Process and log data directly
      const users = data.filter((chat) => chat.type === "user");
      const groups = data.filter((chat) => chat.type === "group");

      const unseenCounts = data.map((chat) => ({
        chatId: chat.id,
        unseenCount: chat.unseenCount,
      }));

      // Update the state
      setChats({ users, groups });
      setUnseenCounts(unseenCounts); // New state for unseen counts
      // console.log(chats,unseenCounts);
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
          ? `${Chat_Url}/api/messages/private/${chatId}`
          : `${Chat_Url}/api/messages/group/${chatId}`;
      const response = await fetch(endpoint, {
        headers: {
          token: token,
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
    // console.log("content "+ content);
    const eventName =
      activeChat.type === "user" ? "private message" : "group message";

    const payload =
      activeChat.type === "user"
        ? { recipientId: activeChat.id, content }
        : { groupId: activeChat.id, content };

    const message = {
      id: Date.now(), // Unique key
      sender: userInfo._id,
      recipient: activeChat.id,
      content,
      timestamp: new Date().toISOString(), // Proper timestamp
    };

    // console.log("send message payload "+ JSON.stringify(message));
    setMessages((prevMessages) => [...prevMessages, message]);
    // Emit the message via socket
    socket.emit(eventName, payload, (response) => {
      if (response.error) {
        console.error("Error sending message:", response.error);
        setError("Failed to send message. Please try again.");
      } else {
        // Update the last message and timestamp in the chats state
        const updatedChats = chats.users.map((user) => {
          if (user.id === activeChat.id) {
            return {
              ...user,
              lastMessage: content, // Set the last message as the content
              timestamp: new Date().toISOString(), // Set the current timestamp
            };
          }
          return user;
        });

        // Update the chats state with the new last message and timestamp
        setChats({ ...chats, users: updatedChats });
      }
    });
    // Clear the input message after sending
    setInputMessage("");
  };

  const updateChats = (user) => {
    setChats((prevChats) => {
      // Check if the user already exists
      handleMessageClick(user);
      const userExists = prevChats.users.some(
        (existingUser) => existingUser.id === user.id
      );

      // If the user doesn't exist, add them
      if (!userExists) {
        return {
          ...prevChats,
          users: [...prevChats.users, user],
        };
      }

      return prevChats;
    });
  };
  const handleBackClick = () => {
    setActiveChat(null);
    const rightContent = document.querySelector(".message-right-content");
    rightContent.classList.remove("active");
  };
  const updateUnseenCounts = (chatId) => {};

  return (
    <ChatContext.Provider
      value={{
        updateUnseenCounts,
        unseenCounts,
        userInfo,
        loading,
        error,
        updateChats,
        fetchAllMembers,
        token,
        activeChat,
        setChats,
        handleBackClick,
        inputMessage,
        setInputMessage,
        chats,
        messages,
        handleMessageClick,
        sendMessage,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}
