import React, { useState, useRef, useEffect } from "react";
import "./OpenAiBtn.css"; 
import OpenAi from "./OpenAi";
import ChatBotImg from "../images/chat-bot.png";

const ChatbotButton = ({ onClick, isChatOpen }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Constrain position within viewport
  const constrainPosition = (x, y) => {
    const buttonSize = 60; // Button width/height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Constrain X position
    const constrainedX = Math.max(
      0, 
      Math.min(x, windowWidth - buttonSize)
    );

    // Constrain Y position
    const constrainedY = Math.max(
      0, 
      Math.min(y, (windowHeight <= 990 ? windowHeight - buttonSize-50 : windowHeight - buttonSize))
    );

    return { x: constrainedX, y: constrainedY };
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    // Prevent default to stop text selection and image dragging
    e.preventDefault();
    
    // Check if it's a touch event
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX !== undefined && clientY !== undefined) {
      setIsDragging(true);
      startPosRef.current = {
        x: clientX - position.x,
        y: clientY - position.y
      };
    }
  };

  // Handle mouse/touch move during dragging
  const handleMouseMove = (e) => {
    // Prevent default to stop scrolling during drag
    e.preventDefault();

    if (isDragging) {
      // Get correct coordinates for mouse or touch events
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      if (clientX !== undefined && clientY !== undefined) {
        const newX = clientX - startPosRef.current.x;
        const newY = clientY - startPosRef.current.y;
        
        // Constrain movement within window
        const constrainedPos = constrainPosition(newX, newY);
        setPosition(constrainedPos);
      }
    }
  };

  // Stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      // Add both mouse and touch events
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Adjust chatbox position based on button position
  const getChatboxStyle = () => {
    // For mobile, return full-screen style
    if (window.innerWidth <= 990) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      };
    }
    
    // For desktop, ensure chatbox is always visible
    const chatboxWidth = 400;
    const chatboxHeight = 500;
    const buttonSize = 60;
    const padding = 20; // Minimum padding from screen edges

    let left, bottom;

    // Determine horizontal positioning
    if (position.x + buttonSize + chatboxWidth > window.innerWidth) {
      // If chatbox would overflow right side, position it to the left of the button
      left = position.x - chatboxWidth;
    } else {
      // Position to the right of the button
      left = position.x + buttonSize;
    }

    // Ensure left is within screen bounds
    left = Math.max(padding, Math.min(left, window.innerWidth - chatboxWidth - padding));

    // Determine vertical positioning
    if (position.y + chatboxHeight > window.innerHeight) {
      // If chatbox would overflow bottom, position it above the button
      bottom = window.innerHeight - position.y;
    } else {
      // Position below the button
      bottom = window.innerHeight - (position.y + buttonSize + chatboxHeight);
    }

    // Ensure bottom is within screen bounds
    bottom = Math.max(padding, Math.min(bottom, window.innerHeight - chatboxHeight - padding));

    return {
      position: 'fixed',
      left: left,
      bottom: bottom,
      width: '400px',
      height: '500px'
    };
  };

  return (
    <>
      <div 
        ref={buttonRef}
        className="chatbot-button" 
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onClick={onClick}
      >
        <img
          src={ChatBotImg}
          alt="Chatbot"
          className="chatbot-icon2"
          draggable="false"
        />
      </div>
      {isChatOpen && (
        <div 
          className="openai-container" 
          style={getChatboxStyle()}
        >
          <OpenAi onClick={onClick} />
        </div>
      )}
    </>
  );
};

export default ChatbotButton;