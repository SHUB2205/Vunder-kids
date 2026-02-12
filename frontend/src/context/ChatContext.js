import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, CHAT_BASE_URL } from '../config/api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  const connectSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      socketRef.current = io(CHAT_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('new private message', (message) => {
        setMessages(prev => [...prev, message]);
        updateConversationWithNewMessage(message);
        setUnreadCount(prev => prev + 1);
      });

      socketRef.current.on('user online', (userId) => {
        setOnlineUsers(prev => [...prev, userId]);
      });

      socketRef.current.on('user offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.recipientId === message.sender._id || conv.recipientId === message.recipient
      );
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unread: updated[existingIndex].unread + 1,
        };
        return updated;
      }
      return prev;
    });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_CONVERSATIONS);
      setConversations(response.data.conversations);
      return response.data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  };

  const fetchMessages = async (recipientId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_MESSAGES}/${recipientId}`);
      setMessages(response.data.messages);
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  const sendMessage = (recipientId, content) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('private message', { recipientId, content }, (response) => {
        if (response.success) {
          setMessages(prev => [...prev, response.message]);
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const joinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('join room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave room', roomId);
    }
  };

  const markAsRead = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv._id === conversationId ? { ...conv, unread: 0 } : conv
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentChat,
        messages,
        onlineUsers,
        unreadCount,
        connectSocket,
        disconnectSocket,
        fetchConversations,
        fetchMessages,
        sendMessage,
        joinRoom,
        leaveRoom,
        markAsRead,
        setCurrentChat,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
