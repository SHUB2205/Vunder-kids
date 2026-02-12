import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { useNotification } from '../../context/NotificationContext';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const NOTIFICATION_TABS = ['All', 'Matches', 'Requests'];

const NotificationsScreen = ({ navigation }) => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [followingUsers, setFollowingUsers] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleFollowUser = async (userId) => {
    if (loadingFollow[userId]) return;
    
    setLoadingFollow(prev => ({ ...prev, [userId]: true }));
    try {
      await api.post(API_ENDPOINTS.FOLLOW_USER, { userId });
      setFollowingUsers(prev => ({ ...prev, [userId]: true }));
      Alert.alert('Success', 'You are now following this user!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to follow user');
    } finally {
      setLoadingFollow(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'Matches':
        return notifications.filter(n => n.type === 'match' || n.type === 'match_invite' || n.type === 'score_update');
      case 'Requests':
        return notifications.filter(n => n.type === 'follow' || n.type === 'follow_request' || n.type === 'match_request');
      default:
        return notifications;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification._id);

    switch (notification.type) {
      case 'follow':
        navigation.navigate('UserProfile', { userId: notification.sender._id });
        break;
      case 'like':
      case 'comment':
        navigation.navigate('PostDetail', { post: notification.post });
        break;
      case 'match':
        navigation.navigate('MatchDetail', { match: notification.match });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return 'person-add';
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'match':
        return 'trophy';
      case 'message':
        return 'mail';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'follow':
        return COLORS.primary;
      case 'like':
        return COLORS.error;
      case 'comment':
        return COLORS.info;
      case 'match':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationCard}>
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.notificationItemUnread]}
        onPress={() => handleNotificationPress(item)}
      >
        <Image 
          source={{ uri: item.sender?.avatar || 'https://via.placeholder.com/50' }} 
          style={styles.avatar} 
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.senderName}>
              {item.sender?.userName || item.sender?.name || 'Someone'}
            </Text>{' '}
            {item.message || 'sent you a notification'}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
      </TouchableOpacity>
      
      {/* Action buttons for follow requests */}
      {(item.type === 'follow_request' || item.type === 'follow') && !followingUsers[item.sender?._id] && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.followBackBtn, loadingFollow[item.sender?._id] && styles.followBackBtnDisabled]}
            onPress={() => handleFollowUser(item.sender?._id)}
            disabled={loadingFollow[item.sender?._id]}
          >
            {loadingFollow[item.sender?._id] ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.followBackText}>Follow</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const todayNotifications = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.createdAt);
    return notifDate.toDateString() === today.toDateString();
  });

  const earlierNotifications = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.createdAt);
    return notifDate.toDateString() !== today.toDateString();
  });

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {NOTIFICATION_TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
        </View>
      </View>

      {renderTabs()}

      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              When you get notifications, they'll show up here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.md,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.text,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: BORDER_RADIUS.lg,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  notificationText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  senderName: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    marginLeft: 66,
  },
  followBackBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  followBackBtnDisabled: {
    opacity: 0.7,
  },
  followBackText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
