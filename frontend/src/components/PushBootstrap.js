import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  unregisterPushNotifications,
} from '../services/pushNotifications';

/**
 * Bootstraps push notifications once the user is authenticated.
 * Must be rendered inside AuthProvider and NavigationContainer.
 */
const PushBootstrap = ({ navigationRef }) => {
  const { isAuthenticated } = useAuth();

  // Register token whenever auth state flips to true
  useEffect(() => {
    if (!isAuthenticated) return;
    registerForPushNotificationsAsync();
    return () => {
      // Best-effort: clear the token when this user logs out
      unregisterPushNotifications();
    };
  }, [isAuthenticated]);

  // Attach tap / foreground listeners once at mount
  useEffect(() => {
    const cleanup = setupNotificationListeners(navigationRef);
    return cleanup;
  }, [navigationRef]);

  return null;
};

export default PushBootstrap;
