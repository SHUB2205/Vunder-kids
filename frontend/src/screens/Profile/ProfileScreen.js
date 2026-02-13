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
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useMatch } from '../../context/MatchContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const { width } = Dimensions.get('window');
const POST_SIZE = (width - SPACING.lg * 2 - 4) / 3;

const PROFILE_TABS = ['Overview', 'Photos', 'Post', 'Reels', 'Matches'];

// Badges with ranges - matching PWA Badges.js
const BADGES = [
  { range: [0, 20], name: 'Learner', icon: '📚', color: '#8B5CF6' },
  { range: [21, 40], name: 'Hunter', icon: '🎯', color: '#F59E0B' },
  { range: [41, 70], name: 'Rising Star', icon: '⭐', color: '#EAB308' },
  { range: [71, 100], name: 'Professional', icon: '💼', color: '#3B82F6' },
  { range: [101, 150], name: 'Winner', icon: '🏆', color: '#10B981' },
  { range: [151, 200], name: 'Achievers', icon: '🎖️', color: '#6366F1' },
  { range: [201, 250], name: 'Conqueror', icon: '👑', color: '#EC4899' },
  { range: [251, 350], name: 'Legend', icon: '🌟', color: '#F97316' },
  { range: [351, 500], name: 'Top Gun', icon: '🔥', color: '#EF4444' },
  { range: [501, 1000], name: 'GOAT', icon: '🐐', color: '#14B8A6' },
];

// Get current badge based on score - matching PWA ProfileBadges.js
const getCurrentBadge = (score) => {
  const sortedBadges = [...BADGES].reverse();
  return sortedBadges.find(badge => score >= badge.range[0] && score <= badge.range[1]) || BADGES[0];
};

// Get badges to display (earned + current)
const getDisplayBadges = (score) => {
  const sortedBadges = [...BADGES].reverse();
  const currentIndex = sortedBadges.findIndex(badge => score >= badge.range[0] && score <= badge.range[1]);
  if (currentIndex === -1) return [{ ...BADGES[0], isCurrent: true }];
  
  const earned = sortedBadges.slice(0, currentIndex).map(b => ({ ...b, isCurrent: false }));
  const current = { ...sortedBadges[currentIndex], isCurrent: true };
  return [...earned, current];
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { matches, fetchMatches } = useMatch();
  const [activeTab, setActiveTab] = useState('Overview');
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats - matching PWA ProfileStats.js getStats function
  const progress = user?.progress || {};
  const stats = {
    coins: progress.overallScore || 0,
    matchesPlayed: progress.totalMatches || 0,
    matchesWon: progress.matchesWon || 0,
    matchesLost: (progress.totalMatches || 0) - (progress.matchesWon || 0),
    winPercent: progress.totalMatches > 0 
      ? Math.ceil((progress.matchesWon * 100) / progress.totalMatches) 
      : 0,
  };
  
  // Get badges based on user's overall score
  const userBadges = getDisplayBadges(stats.coins);
  const currentBadge = getCurrentBadge(stats.coins);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUserPosts(),
      fetchMatches(),
    ]);
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_USER_POSTS(user._id));
      const allPosts = response.data.posts || [];
      setPosts(allPosts.filter(p => p.mediaType !== 'video'));
      setReels(allPosts.filter(p => p.mediaType === 'video'));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getUserMatches = () => {
    return (matches || []).filter(m => 
      m.creator?._id === user?._id || 
      m.players?.some(p => p._id === user?._id)
    );
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'Photos':
        return posts.filter(p => p.mediaType === 'image');
      case 'Post':
        return posts;
      case 'Reels':
        return reels;
      case 'Matches':
        return getUserMatches();
      default:
        return posts;
    }
  };

  const renderPostItem = ({ item }) => {
    // For Matches tab, render match cards
    if (activeTab === 'Matches') {
      return (
        <TouchableOpacity
          style={styles.matchItem}
          onPress={() => navigation.navigate('MatchDetail', { match: item })}
        >
          <View style={styles.matchItemIcon}>
            <Ionicons name="trophy" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.matchItemInfo}>
            <Text style={styles.matchItemName}>{item.name || 'Match'}</Text>
            <Text style={styles.matchItemMeta}>
              {item.sport?.name} • {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.matchItemStatus, 
            item.status === 'completed' && { color: COLORS.success },
            item.status === 'in-progress' && { color: COLORS.error }
          ]}>
            {item.status === 'completed' ? 'Completed' : item.status === 'in-progress' ? 'Live' : 'Upcoming'}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // For Posts/Photos/Reels tabs, render grid items
    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      >
        <Image source={{ uri: item.mediaURL }} style={styles.postImage} />
        {item.mediaType === 'video' && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={16} color={COLORS.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStatsCard = (icon, label, value, color) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsCardLabel}>{label}</Text>
      <View style={styles.statsCardContent}>
        <Text style={styles.statsCardIcon}>{icon}</Text>
        <Text style={styles.statsCardValue}>{value}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Profile Info Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <Image 
            source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                <Text style={styles.statNumber}>{posts.length}</Text> posts
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Followers')}>
                <Text style={styles.statText}>
                  <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text> followers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Following')}>
                <Text style={styles.statText}>
                  <Text style={styles.statNumber}>{user?.following?.length || 0}</Text> following
                </Text>
              </TouchableOpacity>
            </View>
            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
            <View style={styles.metaRow}>
              {user?.location && (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={14} color={COLORS.error} />
                  <Text style={styles.metaText}>{user.location}</Text>
                </View>
              )}
              {user?.occupation && (
                <View style={styles.metaItem}>
                  <Ionicons name="briefcase" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>{user.occupation}</Text>
                </View>
              )}
            </View>
            <View style={styles.accountTypeRow}>
              <Ionicons name="lock-open" size={12} color={COLORS.textSecondary} />
              <Text style={styles.accountTypeText}>Public Account</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Badges Section - matching PWA ProfileBadges.js */}
        <View style={styles.badgesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <TouchableOpacity onPress={() => Alert.alert('All Badges', BADGES.map(b => `${b.icon} ${b.name} (${b.range[0]}-${b.range[1]} coins)`).join('\n'))}>
              <Text style={styles.viewMoreText}>View More ▾</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userBadges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <View style={[styles.badgeCircle, { backgroundColor: badge.color + '30' }]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
                {badge.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
                {badge.isCurrent && (
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill, 
                      { width: `${((stats.coins - badge.range[0]) / (badge.range[1] - badge.range[0])) * 100}%` }
                    ]} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Passions Section */}
        <View style={styles.passionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Passions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditPassions')}>
              <Text style={styles.editPassionsText}>✏️ Edit Passions</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(user?.passions || [{ name: 'Football', skillLevel: 'Intermediate' }, { name: 'Basketball', skillLevel: 'Pro' }]).map((passion, index) => (
              <View key={index} style={styles.passionCard}>
                <View style={styles.passionImagePlaceholder}>
                  <Ionicons name="football" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.passionName}>{passion.name}</Text>
                <Text style={styles.passionLevel}>{passion.skillLevel}</Text>
                <View style={styles.passionDots}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={[styles.dot, passion.skillLevel === 'Pro' && styles.dotActive]} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Profile Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROFILE_TABS.map((tab) => (
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
        </ScrollView>
      </View>

      {/* Stats Grid - Only show on Overview tab - 2 cards per row */}
      {activeTab === 'Overview' && (
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {renderStatsCard('🏆', 'Coins', stats.coins)}
            {renderStatsCard('🎾', 'Matches played', stats.matchesPlayed)}
          </View>
          <View style={styles.statsRow}>
            {renderStatsCard('🥇', 'Matches won', stats.matchesWon)}
            {renderStatsCard('😢', 'Matches lost', stats.matchesLost)}
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, styles.statsCardWide]}>
              <Text style={styles.statsCardLabel}>Win/loss %</Text>
              <View style={styles.statsCardContent}>
                <Text style={styles.statsCardIcon}>🎯</Text>
                <Text style={styles.statsCardValue}>{stats.winPercent}%</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerUsername}>{user?.userName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add-circle-outline" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Ionicons name="menu-outline" size={28} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={getTabContent()}
        renderItem={renderPostItem}
        keyExtractor={(item) => item._id}
        numColumns={activeTab === 'Matches' ? 1 : 3}
        key={activeTab === 'Matches' ? 'matches' : 'grid'}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'Matches' ? 'trophy-outline' : 'images-outline'} 
              size={48} 
              color={COLORS.textLight} 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'Matches' ? 'No matches yet' : 'No posts yet'}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerUsername: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: SPACING.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  headerContent: {
    paddingBottom: SPACING.md,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  profileTopRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surface,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  statText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.lg,
  },
  statNumber: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  accountTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountTypeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  editProfileBtn: {
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  editProfileBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  badgesSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 80,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    textAlign: 'center',
  },
  currentBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  passionsSection: {
    marginBottom: SPACING.sm,
  },
  editPassionsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  passionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passionImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  dotActive: {
    backgroundColor: COLORS.text,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.small,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
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
  statsGrid: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statsCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  statsCardWide: {
    width: '100%',
  },
  statsCardLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  statsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  statsCardValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  postItem: {
    width: POST_SIZE,
    height: POST_SIZE,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
  },
  videoIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  matchItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchItemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  matchItemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchItemMeta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  matchItemStatus: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});

export default ProfileScreen;
