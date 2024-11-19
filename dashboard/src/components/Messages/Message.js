import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import io from "socket.io-client";
import './Message.css';
import { ReactComponent as SearchIcon } from '../images/search.svg';
// import { ReactComponent as ImageIcon } from '../images/image.svg';
// import { ReactComponent as GifIcon } from '../images/gif.svg';
// import { ReactComponent as EmojiIcon } from '../images/emoji.svg';
import { ReactComponent as SendIcon } from '../images/send.svg';
import { ChatContext } from '../../createContext/Chat/ChatContext';
import UserPhoto from '../images/UserPhoto3.png';

const Message = () => {
  const SERVER_URL = "http://localhost:4000";
  const { userInfo } = useContext(ChatContext)
  const [activeChat, setActiveChat] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [chats, setChats] = useState({ users: [], groups: [] });
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const handleMessageClick = (user) => {

    setActiveChat({ type: "user", id: user.id, name: user.name })
    console.log("clock on the handle"+activeChat);
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
      console.log(activeChat);
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
    <div className='message-container'>
      {error && <div className="error-banner">{error}</div>}
      <div className="message-middle-content">
        <h2 className="message-heading">Messages</h2>
        <div className="message-search-container">
          <SearchIcon className="message-search-icon" />
          <input type="text" placeholder="Search Direct Messages" className="message-search-input" />
        </div>
        {/* userlist */}
        <div className="message-list">
          {chats.users.map((user) => (
            <div
              key={user.id}
              className="message-item"
              onClick={() => handleMessageClick(user)}
            >
              <img src={UserPhoto} alt={user.name} className="message-avatar" />
              <div className="message-item-content">
                <div className="message-item-name">{user.name} <span className="message-item-handle">@{user.name.split(' ')[0].toLowerCase()}</span></div>
                <div className="message-item-text">Hi khadar how are you!</div>
              </div>
              <div className="message-item-date">Jan 7</div>
            </div>
          ))}
        </div>
      </div>

      <div className="message-right-content">
        <h3>{activeChat ? activeChat.name : "Select a chat"}</h3>
        <div className="message-chat-container">
          {activeChat && messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message-chat-message ${(message.sender._id === userInfo._id || message.sender===userInfo._id)
                    ? "message-chat-self"
                    : "message-chat-other"
                  }`}
              >
                <p className="message-chat-text">{message.content}</p>
                <span className="message-chat-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="no-messages">No messages yet.</div>
          )}
        </div>
        <div className="message-input-container">
          <input
            type="text"
            placeholder="Start a new message"
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            className="message-send-button"
            onClick={() => sendMessage(inputMessage)}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;