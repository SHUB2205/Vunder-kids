import React, { useState, useRef, useEffect, useCallback,useContext } from "react";
import "./OpenAi.css";
import { ReactComponent as SendIcon } from "../images/send.svg";
import isAuth from "../../createContext/is-Auth/IsAuthContext";
import ChatbotWelcome from "./ChatbotWelcome";
const Backend_URL = process.env.REACT_APP_BACKEND_URL;
const ChatBot = ({ onClick }) => {
  const {token} = useContext(isAuth);  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef(null);
  const sessionId = "userSession"; // Static session ID or dynamic based on your needs

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

  // Fetch conversation history from sessionStorage
  const fetchConversationHistory = () => {
    const conversationHistory = JSON.parse(sessionStorage.getItem("conversationHistory")) || [];
    return conversationHistory;
  };

  // Save conversation history to sessionStorage
  const saveConversationHistory = (conversationHistory) => {
    sessionStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
  };

  // Handle sending the user message and bot response
  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      const conversationHistory = fetchConversationHistory();
      addMessage(inputMessage, "user"); // Add user message
      conversationHistory.push({ role: "user", content: inputMessage });

      // Send the message to the backend
      fetch(`${Backend_URL}/api/ai/askOpenai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({ question: inputMessage, sessionId }),
      })
        .then((response) => response.json())
        .then(({ reply }) => {
          addMessage(reply, "bot"); // Add bot's response
          conversationHistory.push({ role: "assistant", content: reply });

          // Save updated history to sessionStorage
          saveConversationHistory(conversationHistory);
        })
        .catch((error) => {
          console.error("Error during the API request:", error);
        });

      setInputMessage(""); // Clear input field
    }
  }, [inputMessage, addMessage]);

  // Render each message
  const renderMessages = () =>
    messages.length > 0 ? (
      messages.map(({ id, content, sender, timestamp }) => (
        <div
          key={id}
          className={`message-chat-message ${sender === "user" ? "message-chat-self" : "message-chat-other"}`}
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
      <div className="no-messages"><ChatbotWelcome/></div>
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
