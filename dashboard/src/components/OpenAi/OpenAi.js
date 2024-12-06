import React, { useState, useRef, useEffect, useCallback } from "react";
import "./OpenAi.css";
import { ReactComponent as SendIcon } from "../images/send.svg";

const ChatBot = ({ onClick }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Add a new message to the chat
  const addMessage = useCallback((content, sender) => {
    const message = {
      id: Date.now() + Math.random(), // Unique ID
      content,
      sender,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Handle sending the user message and bot response
  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      addMessage(inputMessage, "user"); // Add user message

      // Simulate a bot response
      setTimeout(() => {
        addMessage(`You said: ${inputMessage}`, "bot");
      }, 500);

      setInputMessage(""); // Clear input
    }
  }, [inputMessage, addMessage]);

  // Render each message
  const renderMessages = () =>
    messages.length > 0 ? (
      messages.map(({ id, content, sender, timestamp }) => (
        <div
          key={id}
          className={`message-chat-message ${
            sender === "user" ? "message-chat-self" : "message-chat-other"
          }`}
        >
          <p className="message-chat-text">{content}</p>
          <span className="message-chat-time">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      ))
    ) : (
      <div className="no-messages">No messages yet.</div>
    );

  return (
    <div className="chatbot-container">
      <div className="chatbot-middle-content">
        {/* Header */}
        <div className="chatbot-heading">
          <h2>ChatBot</h2>
          <button className="close-button2" onClick={onClick}>
            ×
          </button>
        </div>

        {/* Messages Container */}
        <div className="chatbot-chat-container" ref={chatContainerRef}>
          {renderMessages()}
        </div>

        {/* Input Container */}
        <div className="chatbot-input-container">
          <input
            type="text"
            placeholder="Type a message"
            className="chatbot-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button
            className="chatbot-send-button"
            onClick={handleSendMessage}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
