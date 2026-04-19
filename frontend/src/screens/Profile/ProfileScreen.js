import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useMatch } from '../../context/MatchContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportIcon, getSportEmoji } from '../../utils/sportIcons';

const { width } = Dimensions.get('window');
const POST_SIZE = (width - SPACING.lg * 2 - 4) / 3;

const PROFILE_TABS = ['Overview', 'Photos', 'Posts', 'Reels', 'Matches'];

const LEVELS = [
  { min: 0,   max: 20,   name: 'Learner',      icon: '📚', color: '#8B5CF6', next: 20 },
  { min: 21,  max: 40,   name: 'Hunter',       icon: '🎯', color: '#F59E0B', next: 40 },
  { min: 41,  max: 70,   name: 'Rising Star',  icon: '⭐', color: '#EAB308', next: 70 },
  { min: 71,  max: 100,  name: 'Professional', icon: '💼', color: '#3B82F6', next: 100 },
  { min: 101, max: 150,  name: 'Winner',       icon: '🏆', color: '#10B981', next: 150 },
  { min: 151, max: 200,  name: 'Achiever',     icon: '🎖️', color: '#6366F1', next: 200 },
  { min: 201, max: 250,  name: 'Conqueror',    icon: '👑', color: '#EC4899', next: 250 },
  { min: 251, max: 350,  name: 'Legend',       icon: '🌟', color: '#F97316', next: 350 },
  { min: 351, max: 500,  name: 'Top Gun',      icon: '🔥', color: '#EF4444', next: 500 },
  { min: 501, max: 99999,name: 'G.O.A.T',      icon: '🐐', color: '#14B8A6', next: 99999 },
];

const getCurrentLevel = (score) => LEVELS.find(l => score >= l.min && score <= l.max) || LEVELS[0];
const getNextLevel = (score) => {
  const idx = LEVELS.findIndex(l => score >= l.min && score <= l.max);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { matches, fetchMatches } = useMatch();
  const [activeTab, setActiveTab] = useState('Overview');
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const xpAnim = useRef(new Animated.Value(0)).current;

  const progress = user?.progress || {};
  const stats = {
    coins: progress.overallScore || 0,
    matchesPlayed: progress.totalMatches || 0,
    matchesWon: progress.matchesWon || 0,
    matchesLost: (progress.totalMatches || 0) - (progress.matchesWon || 0),
    winPercent: progress.totalMatches > 0 ? Math.ceil((progress.matchesWon * 100) / progress.totalMatches) : 0,
    streak: progress.currentStreak || 0,
  };

  const currentLevel = getCurrentLevel(stats.coins);
  const nextLevel = getNextLevel(stats.coins);
  const xpInLevel = stats.coins - currentLevel.min;
  const xpNeeded = currentLevel.max - currentLevel.min;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  useEffect(() => {
    fetchUserData();
    Animated.timing(xpAnim, { toValue: xpPercent, duration: 1200, useNativeDriver: false }).start();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    await Promise.all([fetchUserPosts(), fetchMatches()]);
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_USER_POSTS(user._id));
      const allPosts = response.data.posts || [];
      setPosts(allPosts.filter(p => p.mediaType !== 'video'));
      setReels(allPosts.filter(p => p.mediaType === 'video'));
    } catch (error) { console.error('Error fetching posts:', error); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const getUserMatches = () => (matches || []).filter(m =>
    m.creator?._id === user?._id || m.players?.some(p => p._id === user?._id)
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'Photos': return posts.filter(p => p.mediaType === 'image');
      case 'Posts': return posts;
      case 'Reels': return reels;
      case 'Matches': return getUserMatches();
      default: return posts;
    }
  };

  const renderMatchItem = (item) => {
    const isPast = new Date(item.date) < new Date();
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
      >
        <View style={[styles.matchItemIconWrap, { backgroundColor: item.status === 'completed' ? COLORS.success + '20' : item.status === 'in-progress' ? COLORS.error + '20' : COLORS.primary + '20' }]}>
          <Text style={{ fontSize: 20 }}>{getSportEmoji(item.sport?.name)}</Text>
        </View>
        <View style={styles.matchItemInfo}>
          <Text style={styles.matchItemName}>{item.name || 'Match'}</Text>
          <Text style={styles.matchItemMeta}>{item.sport?.name} • {new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.matchStatusBadge, {
          backgroundColor: item.status === 'completed' ? COLORS.success + '20' :
            item.status === 'in-progress' ? COLORS.error + '20' : COLORS.primary + '15'
        }]}>
          <Text style={[styles.matchStatusText, {
            color: item.status === 'completed' ? COLORS.success :
              item.status === 'in-progress' ? COLORS.error : isPast ? COLORS.textSecondary : COLORS.primary
          }]}>
            {item.status === 'completed' ? '✅ Done' : item.status === 'in-progress' ? '🔴 Live' : isPast ? 'Past' : '📅 Soon'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPostItem = ({ item }) => {
    if (activeTab === 'Matches') return renderMatchItem(item);
    return (
      <TouchableOpacity style={styles.postItem} onPress={() => navigation.navigate('PostDetail', { post: item })}>
        <Image source={{ uri: item.mediaURL }} style={styles.postImage} />
        {item.mediaType === 'video' && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={14} color={COLORS.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const xpBarWidth = xpAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            <View style={[styles.levelBadgeOnAvatar, { backgroundColor: currentLevel.color }]}>
              <Text style={styles.levelBadgeText}>{currentLevel.icon}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.username}>@{user?.userName}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}><Text style={styles.statNumber}>{posts.length}</Text> posts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Followers')}>
                <Text style={styles.statText}><Text style={styles.statNumber}>{user?.followers?.length || 0}</Text> followers</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Following')}>
                <Text style={styles.statText}><Text style={styles.statNumber}>{user?.following?.length || 0}</Text> following</Text>
              </TouchableOpacity>
            </View>
            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={14} color={COLORS.white} />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Level & XP Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelCardTop}>
          <View style={styles.levelBadgeLarge}>
            <Text style={styles.levelBadgeLargeIcon}>{currentLevel.icon}</Text>
          </View>
          <View style={styles.levelInfo}>
            <View style={styles.levelNameRow}>
              <Text style={[styles.levelName, { color: currentLevel.color }]}>{currentLevel.name}</Text>
              {stats.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={styles.streakText}>{stats.streak} day streak</Text>
                </View>
              )}
            </View>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>
                {stats.coins} / {currentLevel.max} XP
              </Text>
              {nextLevel && <Text style={styles.nextLevelText}>→ {nextLevel.icon} {nextLevel.name}</Text>}
            </View>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinCount}>{stats.coins}</Text>
          </View>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.xpBarBg}>
          <Animated.View style={[styles.xpBarFill, { width: xpBarWidth, backgroundColor: currentLevel.color }]} />
        </View>
        <Text style={styles.xpPercent}>{xpPercent}% to next level</Text>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.quickStatsRow}>
        <View style={[styles.quickStatCard, { borderTopColor: COLORS.primary }]}>
          <Text style={styles.quickStatIcon}>🎾</Text>
          <Text style={styles.quickStatValue}>{stats.matchesPlayed}</Text>
          <Text style={styles.quickStatLabel}>Played</Text>
        </View>
        <View style={[styles.quickStatCard, { borderTopColor: COLORS.success }]}>
          <Text style={styles.quickStatIcon}>🥇</Text>
          <Text style={styles.quickStatValue}>{stats.matchesWon}</Text>
          <Text style={styles.quickStatLabel}>Won</Text>
        </View>
        <View style={[styles.quickStatCard, { borderTopColor: COLORS.error }]}>
          <Text style={styles.quickStatIcon}>😤</Text>
          <Text style={styles.quickStatValue}>{stats.matchesLost}</Text>
          <Text style={styles.quickStatLabel}>Lost</Text>
        </View>
        <View style={[styles.quickStatCard, { borderTopColor: '#F59E0B' }]}>
          <Text style={styles.quickStatIcon}>🎯</Text>
          <Text style={styles.quickStatValue}>{stats.winPercent}%</Text>
          <Text style={styles.quickStatLabel}>Win Rate</Text>
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏅 Achievement Badges</Text>
          <TouchableOpacity onPress={() => Alert.alert('All Badges', LEVELS.map(l => `${l.icon} ${l.name}: ${l.min}-${l.max} XP`).join('\n'))}>
            <Text style={styles.viewMoreText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LEVELS.map((level, idx) => {
            const earned = stats.coins >= level.min;
            const isCurrent = stats.coins >= level.min && stats.coins <= level.max;
            return (
              <View key={idx} style={[styles.badgeItem, !earned && styles.badgeItemLocked]}>
                <View style={[styles.badgeCircle, { backgroundColor: earned ? level.color + '25' : '#E5E7EB' }, isCurrent && styles.badgeCircleCurrent]}>
                  <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>{level.icon}</Text>
                  {isCurrent && <View style={[styles.badgeGlow, { backgroundColor: level.color + '30' }]} />}
                </View>
                <Text style={[styles.badgeName, earned && { color: level.color }]}>{level.name}</Text>
                {isCurrent && <View style={[styles.currentChip, { backgroundColor: level.color }]}><Text style={styles.currentChipText}>NOW</Text></View>}
                {!earned && <Text style={styles.badgeLockIcon}>🔒</Text>}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Passions Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚽ My Sports</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditPassions')}>
            <Text style={styles.viewMoreText}>✏️ Edit</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(user?.passions || []).length === 0 ? (
            <TouchableOpacity style={styles.addPassionCard} onPress={() => navigation.navigate('EditPassions')}>
              <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
              <Text style={styles.addPassionText}>Add Sports</Text>
            </TouchableOpacity>
          ) : (user?.passions || []).map((passion, idx) => (
            <View key={idx} style={styles.passionCard}>
              <View style={styles.passionEmojiWrap}>
                <Text style={styles.passionEmoji}>{getSportEmoji(passion.name)}</Text>
              </View>
              <Text style={styles.passionName}>{passion.name}</Text>
              <View style={[styles.skillBadge, {
                backgroundColor:
                  passion.skillLevel === 'Pro' ? COLORS.primary + '20' :
                  passion.skillLevel === 'Intermediate' ? COLORS.warning + '20' : COLORS.secondary + '20'
              }]}>
                <Text style={[styles.skillText, {
                  color: passion.skillLevel === 'Pro' ? COLORS.primary :
                    passion.skillLevel === 'Intermediate' ? '#B45309' : COLORS.secondary
                }]}>{passion.skillLevel || 'Beginner'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROFILE_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Create Post / Match shortcut bar below tabs */}
      {activeTab !== 'Matches' && (
        <View style={styles.createBar}>
          <TouchableOpacity
            style={styles.createBarBtn}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add-circle" size={18} color={COLORS.white} />
            <Text style={styles.createBarBtnText}>Add Post</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeTab === 'Matches' && (
        <View style={styles.createBar}>
          <TouchableOpacity
            style={styles.createBarBtn}
            onPress={() => navigation.navigate('Matches', { screen: 'CreateMatch' })}
          >
            <Ionicons name="add-circle" size={18} color={COLORS.white} />
            <Text style={styles.createBarBtnText}>New Match</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerUsername}>{user?.userName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('CreatePost')}>
            <Ionicons name="add-circle-outline" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Settings')}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={
                activeTab === 'Matches' ? 'trophy-outline' :
                activeTab === 'Reels' ? 'videocam-outline' :
                activeTab === 'Photos' ? 'images-outline' :
                'newspaper-outline'
              }
              size={56}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>
              {activeTab === 'Matches' ? 'No matches yet' :
               activeTab === 'Reels' ? 'No reels yet' :
               activeTab === 'Photos' ? 'No photos yet' :
               'No posts yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'Matches'
                ? 'Create a match to track your games and scores.'
                : activeTab === 'Reels'
                ? 'Share a short video of your best moments.'
                : 'Share your first post with the community.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={() =>
                activeTab === 'Matches'
                  ? navigation.navigate('Matches', { screen: 'CreateMatch' })
                  : navigation.navigate('CreatePost')
              }
            >
              <Ionicons name="add-circle" size={16} color={COLORS.white} />
              <Text style={styles.emptyActionText}>
                {activeTab === 'Matches' ? 'Set a Match' : activeTab === 'Reels' ? 'Create Reel' : 'Create Post'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white },
  headerUsername: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.text },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { marginLeft: SPACING.md },
  listContent: { paddingBottom: 100 },
  headerContent: { paddingBottom: SPACING.sm },

  // Profile Card
  profileCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.small },
  profileTopRow: { flexDirection: 'row', marginBottom: SPACING.md },
  avatarContainer: { position: 'relative', marginRight: SPACING.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border },
  levelBadgeOnAvatar: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  levelBadgeText: { fontSize: 12 },
  profileInfo: { flex: 1 },
  name: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  username: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xs },
  statText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  statNumber: { fontWeight: '700', color: COLORS.text },
  bio: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 18 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.text, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start', gap: SPACING.xs },
  editProfileBtnText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },

  // Level Card
  levelCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.small },
  levelCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  levelBadgeLarge: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, borderWidth: 2, borderColor: COLORS.border },
  levelBadgeLargeIcon: { fontSize: 26 },
  levelInfo: { flex: 1 },
  levelNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  levelName: { fontSize: FONTS.sizes.lg, fontWeight: '800' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, gap: 3 },
  streakIcon: { fontSize: 12 },
  streakText: { fontSize: FONTS.sizes.xs, color: '#EA580C', fontWeight: '700' },
  xpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '500' },
  nextLevelText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  coinBadge: { alignItems: 'center' },
  coinIcon: { fontSize: 20 },
  coinCount: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text },
  xpBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpPercent: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'right' },

  // Quick Stats
  quickStatsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginTop: SPACING.sm, gap: SPACING.sm },
  quickStatCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, ...SHADOWS.small },
  quickStatIcon: { fontSize: 20, marginBottom: 4 },
  quickStatValue: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  quickStatLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },

  // Section Card
  sectionCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.small },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  viewMoreText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  // Badges
  badgeItem: { alignItems: 'center', marginRight: SPACING.lg, width: 72, position: 'relative' },
  badgeItemLocked: { opacity: 0.5 },
  badgeCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xs, position: 'relative' },
  badgeCircleCurrent: { borderWidth: 2.5, borderColor: 'transparent' },
  badgeGlow: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 32 },
  badgeIcon: { fontSize: 26, zIndex: 1 },
  badgeIconLocked: { opacity: 0.5 },
  badgeName: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' },
  currentChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full, marginTop: 3 },
  currentChipText: { fontSize: 8, color: COLORS.white, fontWeight: '800' },
  badgeLockIcon: { fontSize: 10, marginTop: 2 },

  // Passions
  addPassionCard: { width: 90, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginRight: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', height: 100 },
  addPassionText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, marginTop: SPACING.xs, fontWeight: '600' },
  passionCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginRight: SPACING.sm, alignItems: 'center', width: 90, borderWidth: 1, borderColor: COLORS.border },
  passionEmojiWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xs, ...SHADOWS.small },
  passionEmoji: { fontSize: 24 },
  passionName: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  skillBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  skillText: { fontSize: 9, fontWeight: '700' },

  // Tabs
  tabsContainer: { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, ...SHADOWS.small },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginRight: SPACING.xs },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Create bar below tabs
  createBar: { marginHorizontal: SPACING.md, marginTop: SPACING.xs, marginBottom: SPACING.xs },
  createBarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, gap: SPACING.xs },
  createBarBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },

  // Posts grid
  postItem: { width: POST_SIZE, height: POST_SIZE, margin: 1, position: 'relative' },
  postImage: { width: '100%', height: '100%', backgroundColor: COLORS.surface },
  videoIndicator: { position: 'absolute', top: SPACING.xs, right: SPACING.xs },

  // Matches
  matchItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.small },
  matchItemIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  matchItemInfo: { flex: 1, marginLeft: SPACING.md },
  matchItemName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  matchItemMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  matchStatusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  matchStatusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: SPACING.xxxl, paddingHorizontal: SPACING.xl },
  emptyText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptySubtext: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center' },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full },
  emptyActionText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});

export default ProfileScreen;
