import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const { width } = Dimensions.get('window');
const POST_SIZE = (width - SPACING.lg * 2 - 4) / 3;

const UserProfileScreen = ({ navigation, route }) => {
  const { userId } = route.params;
  const { user: currentUser, refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        api.get(`${API_ENDPOINTS.GET_USER}/${userId}`),
        api.get(API_ENDPOINTS.GET_USER_POSTS(userId)),
      ]);
      setUser(userRes.data.user);
      setPosts(postsRes.data.posts || []);
      setIsFollowing(userRes.data.user.followers?.includes(currentUser?._id));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.post(API_ENDPOINTS.UNFOLLOW_USER, { userId });
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          followers: prev.followers.filter((id) => id !== currentUser?._id),
        }));
      } else {
        await api.post(API_ENDPOINTS.FOLLOW_USER, { userId });
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser?._id],
        }));
      }
      // Refresh current user to update their following count
      await refreshUser();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('Chat', { recipient: user });
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image source={{ uri: item.mediaURL }} style={styles.postImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.profileCard}>
      {/* Avatar centered */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
      </View>

      {/* Name */}
      <Text style={styles.name}>{user?.name || user?.userName}</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}> posts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Followers', { userId })}
        >
          <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
          <Text style={styles.statLabel}> followers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Following', { userId })}
        >
          <Text style={styles.statNumber}>{user?.following?.length || 0}</Text>
          <Text style={styles.statLabel}> following</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

      {/* Location & Work */}
      <View style={styles.infoRow}>
        {user?.location && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{user.location}</Text>
          </View>
        )}
        {user?.work && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🏢</Text>
            <Text style={styles.infoText}>{user.work}</Text>
          </View>
        )}
      </View>

      {/* Private Account Indicator */}
      {user?.isPrivate && (
        <View style={styles.privateIndicator}>
          <Ionicons name="lock-closed-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.privateText}>Private Account</Text>
        </View>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={handleFollow}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : user?.isPrivate ? 'Request to Follow' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleMessage}
        >
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.text} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>

      {/* Badges Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
          {(user?.badges && user.badges.length > 0) ? (
            user.badges.map((badge, index) => (
              <View key={index} style={styles.badgeCard}>
                <View style={styles.badgeIconContainer}>
                  <Image 
                    source={{ uri: badge.icon || 'https://via.placeholder.com/80' }} 
                    style={styles.badgeIcon}
                  />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
                {badge.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.badgeCard}>
              <View style={styles.badgeIconContainer}>
                <View style={styles.defaultBadgeIcon}>
                  <Text style={styles.defaultBadgeEmoji}>⚽</Text>
                </View>
              </View>
              <Text style={styles.badgeName}>Learner</Text>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Passions Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Passions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.passionsScroll}>
          {(user?.passions && user.passions.length > 0) ? (
            user.passions.map((passion, index) => (
              <View key={index} style={styles.passionCard}>
                <Image 
                  source={{ uri: passion.image || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=80&fit=crop' }} 
                  style={styles.passionImage}
                />
                <Text style={styles.passionName}>{passion.name}</Text>
                <Text style={styles.passionLevel}>{passion.level || 'Foundation'}</Text>
                <View style={styles.passionDots}>
                  {[1,2,3,4,5].map((dot) => (
                    <View 
                      key={dot} 
                      style={[
                        styles.passionDot, 
                        dot <= (passion.levelNum || 2) && styles.passionDotFilled
                      ]} 
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <>
              <View style={styles.passionCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=80&fit=crop' }} 
                  style={styles.passionImage}
                />
                <Text style={styles.passionName}>Basketball</Text>
                <Text style={styles.passionLevel}>Intermediate</Text>
                <View style={styles.passionDots}>
                  {[1,2,3,4,5].map((dot) => (
                    <View key={dot} style={[styles.passionDot, dot <= 3 && styles.passionDotFilled]} />
                  ))}
                </View>
              </View>
              <View style={styles.passionCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=100&h=80&fit=crop' }} 
                  style={styles.passionImage}
                />
                <Text style={styles.passionName}>Football</Text>
                <Text style={styles.passionLevel}>Foundation</Text>
                <View style={styles.passionDots}>
                  {[1,2,3,4,5].map((dot) => (
                    <View key={dot} style={[styles.passionDot, dot <= 2 && styles.passionDotFilled]} />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with @username */}
      <View style={styles.header}>
        <View style={styles.headerSearch}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <Text style={styles.headerUsername}>@{user?.userName}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerUsername: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: '#E8F5E9',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  statNumber: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  bio: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  privateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  privateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  followButton: {
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  followingButtonText: {
    color: COLORS.text,
  },
  messageButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  messageButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  badgesScroll: {
    marginBottom: SPACING.md,
  },
  badgeCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.md,
    minWidth: 120,
  },
  badgeIconContainer: {
    marginBottom: SPACING.sm,
  },
  badgeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  defaultBadgeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBadgeEmoji: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: SPACING.xs,
  },
  currentBadge: {
    backgroundColor: '#3498DB',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  passionsScroll: {
    marginBottom: SPACING.md,
  },
  passionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    marginRight: SPACING.md,
    minWidth: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passionImage: {
    width: 80,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  passionName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  passionLevel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  passionDots: {
    flexDirection: 'row',
    gap: 4,
  },
  passionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  passionDotFilled: {
    backgroundColor: COLORS.text,
  },
});

export default UserProfileScreen;
