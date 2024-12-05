import React, { useState, useRef, useEffect } from "react";
import "./OpenAi.css";
import { ReactComponent as SendIcon } from "../images/send.svg";

const ChatBot = ({ onClick }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Scroll to the bottom of the messages when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now(),
        content: inputMessage,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Simulate bot response
      const botResponse = {
        id: Date.now() + 1,
        content: `You said: ${inputMessage}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);

      setInputMessage("");
    }
  };

  return (
    <div className="message-container">
      <div className="message-middle-content">
        <h2 className="message-heading">
          ChatBot{" "}
          <button className="close-button" onClick={() => onClick}>
            ×
          </button>{" "}
        </h2>
        {/* Messages List */}
        <div className="message-chat-container" ref={chatContainerRef}>
          <div className="no-messages">No messages yet.</div>
        </div>

        {/* Input Container */}
        <div className="message-input-container">
          <input
            type="text"
            placeholder="Type a message"
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button
            className="message-send-button"
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
