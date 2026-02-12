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
  const { user: currentUser } = useAuth();
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
    <View>
      <View style={styles.profileHeader}>
        <Image source={{ uri: user?.avatar }} style={styles.avatar} />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.userName}</Text>
        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
        {user?.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.location}>{user.location}</Text>
          </View>
        )}
      </View>

      {user?.passions?.length > 0 && (
        <View style={styles.passionsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {user.passions.map((passion, index) => (
              <View key={index} style={styles.passionChip}>
                <Ionicons name="trophy" size={14} color={COLORS.primary} />
                <Text style={styles.passionText}>{passion.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton,
          ]}
          onPress={handleFollow}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color={isFollowing ? COLORS.text : COLORS.white} />
          ) : (
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Ionicons name="grid-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="play-circle-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>{user?.userName}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item._id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerUsername: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.surface,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  bioSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  username: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  location: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  passionsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  passionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  passionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  followButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
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
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.text,
  },
  postItem: {
    width: POST_SIZE,
    height: POST_SIZE,
    margin: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
  },
});

export default UserProfileScreen;
