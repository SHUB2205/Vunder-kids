import React, { useContext, useState, useRef, useEffect } from 'react';
import './Message.css';
import { ReactComponent as SearchIcon } from '../images/search.svg';
import { ReactComponent as SendIcon } from '../images/send.svg';
import { ChatContext } from '../../createContext/Chat/ChatContext';
import BackIcon from '../images/BackIcon.png'; // Import the PNG image

const Message = () => {
  const {
    error,
    userInfo,
    activeChat,
    inputMessage,
    setInputMessage,
    chats,
    messages,
    handleMessageClick,
    sendMessage,
    updateChats, // Access updateChats from context
    handleBackClick,
    fetchAllMembers, // Access fetchAllMembers from ChatContext
    updateUnseenCounts,
    unseenCounts,
  } = useContext(ChatContext);

  const [allMembersList, setAllMembersList] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mergedUsers, setMergedUsers] = useState([]);
  const chatContainerRef = useRef(null);

  // Fetch all members on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      if (fetchAllMembers) {
        const members = await fetchAllMembers(); // Call fetchAllMembers from context
        setAllMembersList(members);
      }
    };
    fetchMembers();
  }, [fetchAllMembers]);

  // Merge users from chats and allMembersList, avoiding duplicates
  useEffect(() => {
    const uniqueUsers = [
      ...new Map(
        [...chats.users, ...allMembersList].map((user) => [user.id, user]) // Use Map to remove duplicates
      ).values(),
    ];
    setMergedUsers(uniqueUsers);
  }, [chats.users, allMembersList]);

  const filteredUsers = mergedUsers.filter((user) =>
    user.name && typeof user.name === 'string' && user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Scroll to the bottom of the messages when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle user click to add to chats and set as active chat
  const handleUserSelect = (user) => {
    updateChats(user);
    // Set the clicked user as the active chat
    setSearchActive(false); // Close the search after selection
    setSearchQuery(''); // Clear the search query
  };
  const getUnseenCount = (chatId) => {
    const countObj = unseenCounts.find((item) => item.chatId === chatId);
    return countObj ? countObj.unseenCount : 0;
  };
  return (
    <div className="message-container">
      {error && <div className="error-banner">{error}</div>}

      <div className="message-middle-content">
        <h2 className="message-heading">Messages</h2>

        {/* Search Container */}
        <div className="message-search-container">
          {searchActive ? (
            <img
              src={BackIcon} // Use the BackIcon PNG
              alt="Back"
              className="message-search-icon"
              onClick={() => {
                setSearchActive(false);
                setSearchQuery(''); // Optionally clear the search query when going back
              }}
            />
          ) : (
            <SearchIcon
              className="message-search-icon"
              onClick={() => setSearchActive(true)} // Activate search when clicking the search icon
            />
          )}
          <input
            type="text"
            placeholder="Search Direct Messages"
            className="message-search-input"
            value={searchQuery}
            onClick={() => setSearchActive(true)}
            onChange={(e) => setSearchQuery(e.target.value)} // Allow input even without clicking the icon
            autoFocus={searchActive} // Auto-focus input when search is active
          />
        </div>

        {/* User List */}
        <div className="message-list">
          {searchActive
            ? filteredUsers.length > 0
              ? filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="message-item"
                  onClick={() => handleUserSelect(user)} // Handle user selection from search results
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="message-avatar"
                  />
                  <div className="message-item-content">
                    <div className="message-item-name">
                      {user.name}{' '}
                      <span className="message-item-handle">
                      </span>
                    </div>
                  </div>
                </div>
              ))
              : <div className="no-users-found">No users found</div>
            : chats.users.length > 0
              ? chats.users.map((user) => (
                <div
                  key={user.id}
                  className="message-item"
                  onClick={() => {
                    console.log("User clicked:", user); // Log the user object
                    handleMessageClick(user);
                  }} // Handle normal chat user click
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="message-avatar"
                  />
                  <div className="message-item-content">
                    <div className="message-item-name">
                      {user.name}
                    </div>
                    {/* {user.lastMessage && (
                      <div className="message-item-text">{user.lastMessage}</div>
                    )} */}
                  </div>
                  {user.timestamp && (
                    <>
                    {/* <div className="message-item-date">
                    {new Date(user.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div> */}
                    <div className="message-unseen-count">
                      {getUnseenCount(user.id) > 0 && (
                        <span className="unseen-count-badge">
                          {getUnseenCount(user.id)}
                        </span>
                      )}
                    </div>
                    </>
                  
                  )}
                </div>
              ))
              : <div className="no-chats">Select a chat</div>}
        </div>
      </div>

      <div className="message-right-content">
        <div className="message-right-header">

          <div className="mobile-back-button" onClick={handleBackClick}>
            ←
          </div>
          {
            activeChat &&
            <img src={activeChat.avatar} alt={activeChat.name} className="message-user-avatar" />
          }
          <h3>{activeChat ? activeChat.name : 'Select a chat'}</h3>
        </div>
        <div
          className="message-chat-container"
          ref={chatContainerRef}
        >
          {activeChat && messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message._id}
                className={`message-chat-message ${message.sender._id === userInfo._id ||
                  message.sender === userInfo._id
                  ? 'message-chat-self'
                  : 'message-chat-other'
                  }`}
              >
                <p className="message-chat-text">{message.content}</p>
                <span className="message-chat-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
            ))
          ) : (
            <div className="no-messages">No messages yet.</div>
          )}
        </div>
        {activeChat ? (
          <div className="message-input-container">
            <input
              type="text"
              placeholder="Start a new message"
              className="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputMessage.trim()) {
                  sendMessage(inputMessage);
                  setInputMessage(''); // Clear input after sending
                }
              }}
            />
            <button
              className="message-send-button"
              onClick={() => {
                if (inputMessage.trim()) {
                  sendMessage(inputMessage);
                  setInputMessage(''); // Clear input after sending
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <SendIcon />
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default Message;
