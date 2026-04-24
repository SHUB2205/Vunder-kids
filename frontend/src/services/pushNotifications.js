import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import api from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

// Foreground handler: show the heads-up banner + play sound
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Ask for permission, fetch the Expo push token, and send it to the backend.
 * Returns the token (or null if unavailable — e.g. simulator, denied, web).
 */
export const registerForPushNotificationsAsync = async () => {
  try {
    // Android requires an explicit channel for heads-up notifications
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[push] permission not granted');
      return null;
    }

    // Resolve the Expo projectId from app config (EAS) so tokens can be issued
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResponse.data;
    if (!token) return null;

    // Send token to backend (ignore failures — we'll retry next login)
    try {
      await api.post(API_ENDPOINTS.REGISTER_PUSH_TOKEN, { token });
    } catch (err) {
      console.log('[push] backend token save failed:', err.message);
    }

    return token;
  } catch (err) {
    console.log('[push] register error:', err.message);
    return null;
  }
};

/**
 * Attach foreground + tap listeners. Pass a navigationRef so taps can deep-link.
 * Returns a cleanup function.
 */
export const setupNotificationListeners = (navigationRef) => {
  const sub1 = Notifications.addNotificationReceivedListener((notification) => {
    // Already handled by setNotificationHandler; hook here if we want custom UI
    console.log('[push] received:', notification?.request?.content?.title);
  });

  const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
    try {
      const data = response?.notification?.request?.content?.data || {};
      if (!navigationRef?.current) return;
      const nav = navigationRef.current;

      switch (data.type) {
        case 'follow':
          if (data.senderId) nav.navigate('Home', { screen: 'UserProfile', params: { userId: data.senderId } });
          break;
        case 'like':
        case 'comment':
          if (data.postId) nav.navigate('Home', { screen: 'PostDetail', params: { postId: data.postId } });
          else nav.navigate('Home', { screen: 'Notifications' });
          break;
        case 'match':
          if (data.matchId) nav.navigate('Matches', { screen: 'MatchDetail', params: { matchId: data.matchId } });
          break;
        case 'message':
          if (data.senderId) nav.navigate('Home', { screen: 'Messages' });
          break;
        default:
          nav.navigate('Home', { screen: 'Notifications' });
      }
    } catch (err) {
      console.log('[push] tap handler error:', err.message);
    }
  });

  return () => {
    sub1.remove();
    sub2.remove();
  };
};

/**
 * Clear the backend-side token (e.g. on logout).
 */
export const unregisterPushNotifications = async () => {
  try {
    await api.post(API_ENDPOINTS.REGISTER_PUSH_TOKEN, { token: null });
  } catch {}
};
