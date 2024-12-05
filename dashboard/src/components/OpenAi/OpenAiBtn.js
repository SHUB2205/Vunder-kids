import React from "react";
import "./OpenAiBtn.css"; // Add styles for the floating button
import OpenAi from "./OpenAi";
import ChatBotImg from "../images/chat-bot.png"
const ChatbotButton = ({ onClick , isChatOpen }) => {
  return (
    <>
    <div className="chatbot-button" onClick={onClick}>
      <img
        src={ChatBotImg} // Replace with the path to your chatbot icon
        alt="Chatbot"
        className="chatbot-icon2"
      />
    </div>
    {isChatOpen && (
        <div className="openai-container">
        <OpenAi onClick={onClick} />
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
