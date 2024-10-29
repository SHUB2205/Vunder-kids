import React, { useState } from 'react';
import './Message.css';
import { ReactComponent as SearchIcon } from '../images/search.svg';
import { ReactComponent as ImageIcon } from '../images/image.svg';
import { ReactComponent as GifIcon } from '../images/gif.svg';
import { ReactComponent as EmojiIcon } from '../images/emoji.svg';
import { ReactComponent as SendIcon } from '../images/send.svg';
import UserPhoto from '../images/UserPhoto3.png';

const Message = () => {
  const [activeChat, setActiveChat] = useState(null);

  const handleMessageClick = (index) => {
    setActiveChat(index);
    const rightContent = document.querySelector('.message-right-content');
    rightContent.classList.add('active');
  };

  const handleBackClick = () => {
    setActiveChat(null);
    const rightContent = document.querySelector('.message-right-content');
    rightContent.classList.remove('active');
  };

  return (
    <div className='message-container'>
      <div className="message-middle-content">
        <h2 className="message-heading">Messages</h2>
        <div className="message-search-container">
          <SearchIcon className="message-search-icon" />
          <input type="text" placeholder="Search Direct Messages" className="message-search-input" />
        </div>
        <div className="message-list">
          {['Cristiano Ronaldo', 'Esther Howard', 'Darrell Steward', 'Darlene Robertson', 'Annette Black'].map((name, index) => (
            <div
              key={index}
              className="message-item"
              onClick={() => handleMessageClick(index)}
            >
              <img src={UserPhoto} alt={name} className="message-avatar" />
              <div className="message-item-content">
                <div className="message-item-name">{name} <span className="message-item-handle">@{name.split(' ')[0].toLowerCase()}</span></div>
                <div className="message-item-text">Hi khadar how are you!</div>
              </div>
              <div className="message-item-date">Jan 7</div>
            </div>
          ))}
        </div>
      </div>
      <div className="message-right-content">
        <div className="mobile-back-button" onClick={handleBackClick}>
          ← Back
        </div>
        <h3>Cristiano Ronaldo</h3>
        <div className="message-user-info">
          <img src={UserPhoto} alt="Cristiano Ronaldo" className="message-user-avatar" />
          <h3 className="message-user-name">Cristiano Ronaldo</h3>
          <p className="message-user-handle">@Cristiano</p>
        </div>
        <div className="message-chat-container">
          <div className="message-chat-message">
            <p className="message-chat-text">Hi khadar how are you!</p>
            <span className="message-chat-time">Mar 21, 2024, 8:50 PM</span>
          </div>
          <div className="message-chat-message message-chat-self">
            <p className="message-chat-text">i am fine</p>
            <span className="message-chat-time">Mar 21, 2024, 9:50 PM</span>
          </div>
        </div>
        <div className="message-input-container">
          <button className="message-action-button"><ImageIcon /></button>
          <button className="message-action-button"><GifIcon /></button>
          <button className="message-action-button"><EmojiIcon /></button>
          <input type="text" placeholder="Start a new message" className="message-input" />
          <button className="message-action-button"><SendIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default Message;