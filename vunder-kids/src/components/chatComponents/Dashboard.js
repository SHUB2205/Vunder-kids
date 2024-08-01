import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import UserList from './UserList';
import GroupList from './GroupList';
import ChatWindow from './ChatWindow';
import CreateGroupModal from './CreateGroupModal';
import './Dashboard.css';

const Dashboard = () => {
  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState({ users: [], groups: [] });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      query: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to chat server. Please try again later.');
    });

    newSocket.on('new message', handleNewMessage);
    newSocket.on('new group message', handleNewMessage);

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id, activeChat.type);
      if (socket) {
        socket.emit('join room', activeChat.id);
      }
    }
    return () => {
      if (socket && activeChat) {
        socket.emit('leave room', activeChat.id);
      }
    };
  }, [activeChat, socket]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/chats', {
        headers: {
          'token': localStorage.getItem('token')
        }
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      setChats({
        users: data.filter(chat => chat.type === 'user'),
        groups: data.filter(chat => chat.type === 'group')
      });
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats. Please refresh the page.');
    }
  }, []);

  const fetchMessages = async (chatId, chatType) => {
    try {
      const endpoint = chatType === 'user' ? `/api/messages/private/${chatId}` : `/api/messages/group/${chatId}`;
      const response = await fetch(endpoint, {
        headers: {
          'token': localStorage.getItem('token')
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    }
  };

  const handleNewMessage = useCallback((message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const sendMessage = (content) => {
    if (!socket || !activeChat) return;

    const eventName = activeChat.type === 'user' ? 'private message' : 'group message';
    const payload = activeChat.type === 'user' 
      ? { recipientId: activeChat.id, content }
      : { groupId: activeChat.id, content };

    socket.emit(eventName, payload, (response) => {
      if (response.error) {
        console.error('Error sending message:', response.error);
        setError('Failed to send message. Please try again.');
      } else {
        handleNewMessage(response.message);
      }
    });
  };

  const createGroup = async (name, memberIds) => {
    try {
      const response = await fetch('/api/messages/group/create', {
        method: 'POST',
        headers: {
          'token': localStorage.getItem('token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, members: memberIds }),
      });
      if (!response.ok) throw new Error('Failed to create group');
      const newGroup = await response.json();
      setChats(prevChats => ({
        ...prevChats,
        groups: [...prevChats.groups, { type: 'group', id: newGroup._id, name: newGroup.name }]
      }));
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      {error && <div className="error-banner">{error}</div>}
      <div className="sidebar">
        <UserList 
          users={chats.users}
          onSelectUser={(user) => setActiveChat({ type: 'user', id: user.id, name: user.name })}
        />
        <GroupList 
          groups={chats.groups}
          onSelectGroup={(group) => setActiveChat({ type: 'group', id: group.id, name: group.name })}
        />
        <button onClick={() => setShowCreateGroup(true)} className="create-group-button">
          Create Group
        </button>
      </div>
      <div className="chat-area">
        {activeChat ? (
          <ChatWindow 
            activeChat={activeChat}
            messages={messages}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="no-chat-selected">
            Select a chat to start messaging
          </div>
        )}
      </div>
      {showCreateGroup && (
        <CreateGroupModal 
          onCreateGroup={createGroup}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;