import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      // Send token to backend
      await axios.post(API_ENDPOINTS.UPDATE_TOKEN, { notificationToken: token });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_NOTIFICATIONS);
      setNotifications(response.data.notifications);
      const unread = response.data.notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      return response.data.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(API_ENDPOINTS.MARK_READ(notificationId));
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => markAsRead(n._id))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        expoPushToken,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        registerForPushNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
