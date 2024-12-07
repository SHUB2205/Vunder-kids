import React from 'react';
import botImage from "../images/bot.png"; // Ensure this path is correct

const ChatbotWelcome = () => {
  return (
    <div className="chatbot-start-conversation flex flex-col items-center justify-center space-y-2 p-4 text-center h-[250px] overflow-hidden z-10">
      <div className="text-lg font-semibold text-gray-600">
        How can I help you today?
      </div>
      
      <img 
        src={botImage} 
        alt="Chatbot" 
        className="chatbot-image w-48 h-48 object-contain hover:scale-105 transition-transform duration-300" 
      />
      
      <div className="welcome-text">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome to Fisiko</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Your intelligent assistant is ready to provide insights and help you explore.
        </p>
      </div>
    </div>
  );
};

export default ChatbotWelcome;