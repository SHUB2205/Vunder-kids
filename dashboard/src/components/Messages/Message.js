import React, { useContext } from 'react';
import './Message.css';
import { ReactComponent as SearchIcon } from '../images/search.svg';
// import { ReactComponent as ImageIcon } from '../images/image.svg';
// import { ReactComponent as GifIcon } from '../images/gif.svg';
// import { ReactComponent as EmojiIcon } from '../images/emoji.svg';
import { ReactComponent as SendIcon } from '../images/send.svg';
import { ChatContext } from '../../createContext/Chat/ChatContext';
import UserPhoto from '../images/UserPhoto3.png';

const Message = () => {
  const { error, userInfo, activeChat, inputMessage, setInputMessage, chats, messages, handleMessageClick, sendMessage } = useContext(ChatContext)

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
          {chats?.users?.length > 0 ? ( // Safe navigation with optional chaining
            chats.users.map((user) => (
              <div
                key={user.id}
                className="message-item"
                onClick={() => handleMessageClick(user)}
              >
                <img src={UserPhoto} alt={user.name} className="message-avatar" />
                <div className="message-item-content">
                  <div className="message-item-name">
                    {user.name} <span className="message-item-handle">@{user.name.split(' ')[0].toLowerCase()}</span>
                  </div>
                  <div className="message-item-text">Hi khadar how are you!</div>
                </div>
                <div className="message-item-date">Jan 7</div>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>


      </div>

      <div className="message-right-content">
        <h3>{activeChat ? activeChat.name : "Select a chat"}</h3>
        <div className="message-chat-container">
          {activeChat && messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message-chat-message ${(message.sender._id === userInfo._id || message.sender === userInfo._id)
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
            style={{background:"none",border:"none", cursor:"pointer"}}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;