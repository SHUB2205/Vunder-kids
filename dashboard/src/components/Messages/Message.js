import React, { useState, useEffect, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import './Message.css';
import { ReactComponent as SearchIcon } from '../images/search.svg';
import { ReactComponent as ImageIcon } from '../images/image.svg';
import { ReactComponent as GifIcon } from '../images/gif.svg';
import { ReactComponent as EmojiIcon } from '../images/emoji.svg';
import { ReactComponent as SendIcon } from '../images/send.svg';
import UserPhoto from '../images/UserPhoto3.png';
import { ChatContext } from '../../createContext/Chat/ChatContext';
import IsAuth from '../../createContext/is-Auth/IsAuthContext';

const Message = () => {
  const SERVER_URL = "http://localhost:4000";
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  
  const { allMembers } = useContext(ChatContext);
  
  // Initialize socket connection
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const newSocket = io(SERVER_URL, {
      query: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Failed to connect to chat server. Please try again later.");
    });

    newSocket.on("new message", handleNewMessage);
    newSocket.on("new group message", handleNewMessage);

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Fetch all previous chats
  const fetchChats = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/messages/chats`, {
        headers: {
          token: sessionStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load previous chats. Please try again.");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages for the active chat
  useEffect(() => {
    if (activeChat) {
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
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again.");
    }
  };

  // Handle new message
  const handleNewMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  const sendMessage = (content) => {
    if (!socket || !activeChat) return;

    const eventName =
      activeChat.type === "user" ? "private message" : "group message";
    const payload =
      activeChat.type === "user"
        ? { recipientId: activeChat.id, content }
        : { groupId: activeChat.id, content };

    socket.emit(eventName, payload, (response) => {
      if (response.error) {
        console.error("Error sending message:", response.error);
        setError("Failed to send message. Please try again.");
      }
    });
  };

  // Search members functionality
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = async () => {
    if (!hasSearched) {
      setHasSearched(true);
      try {
        const result = await allMembers();
        const transformedMembers = result.names.map((name, index) => ({
          name,
          uniqueId: result.uniqueIds[index],
          userName: result.userNames[index],
        }));
        setFilteredMembers(transformedMembers);
      } catch (error) {
        console.error("Error fetching all members:", error);
      }
    }
  };

  const filteredList = filteredMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const noMembersFound = filteredList.length === 0 && searchQuery.length > 0;

  return (
    <div className="message-container">
      {error && <div className="error-banner">{error}</div>}
      <div className="message-middle-content">
        <h2 className="message-heading">Messages</h2>
        <div className="message-search-container">
          <SearchIcon className="message-search-icon" />
          <input
            type="text"
            placeholder="Search Direct Messages"
            className="message-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onClick={handleSearchClick}
          />
        </div>
        <div className="message-list">
          {noMembersFound ? (
            <div className="no-members-found">No members found</div>
          ) : (
            filteredList.map((member, index) => (
              <div
                key={index}
                className="message-item"
                onClick={() => setActiveChat({ type: "user", id: member.uniqueId, name: member.name })}
              >
                <img src={UserPhoto} alt={member.userName} className="message-avatar" />
                <div className="message-item-content">
                  <div className="message-item-name">{member.name} <span className="message-item-handle">@{member.userName}</span></div>
                  <div className="message-item-text">Hi, how are you?</div>
                </div>
                <div className="message-item-date">Jan 7</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="message-right-content">
        <div className="mobile-back-button" onClick={() => setActiveChat(null)}>
          ← Back
        </div>
        <h3>{activeChat ? activeChat.name : "Select a chat"}</h3>
        <div className="message-chat-container">
          {activeChat && messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message-chat-message ${message.sender === activeChat.id ? "message-chat-self" : ""}`}
              >
                <p className="message-chat-text">{message.content}</p>
                <span className="message-chat-time">{message.timestamp}</span>
              </div>
            ))
          ) : (
            <div className="no-messages">No messages yet.</div>
          )}
        </div>
        <div className="message-input-container">
          <button className="message-action-button"><ImageIcon /></button>
          <button className="message-action-button"><GifIcon /></button>
          <button className="message-action-button"><EmojiIcon /></button>
          <input type="text" placeholder="Start a new message" className="message-input" />
          <button className="message-action-button" onClick={() => sendMessage("Test message")}><SendIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default Message;
