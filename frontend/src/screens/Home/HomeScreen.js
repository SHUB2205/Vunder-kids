import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { useMatch } from '../../context/MatchContext';
import StoriesBar from '../../components/Home/StoriesBar';
import PostCard from '../../components/Home/PostCard';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { posts, stories, fetchPosts, fetchStories, createPost, refreshing, setRefreshing } = usePost();
  const { unreadCount: notifCount } = useNotification();
  const { unreadCount: chatCount, connectSocket } = useChat();
  const { matches, fetchMatches } = useMatch();
  
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [posting, setPosting] = useState(false);
  
  // Modals
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreModalType, setScoreModalType] = useState('fisiko');

  useEffect(() => {
    loadData();
    connectSocket();
    fetchMatches();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPosts(), fetchStories()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchStories(), fetchMatches()]);
    setRefreshing(false);
  }, []);

  // Pick image/video for post
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMediaFile(result.assets[0]);
    }
  };

  // Submit post (like PWA Header.js handlePostSubmit)
  const handlePostSubmit = async () => {
    if (!postContent.trim() && !mediaFile) {
      return;
    }

    setPosting(true);
    try {
      const postData = {
        content: postContent,
      };
      if (mediaFile) {
        postData.media = mediaFile;
      }
      
      const result = await createPost(postData);
      if (result.success) {
        setPostContent('');
        setMediaFile(null);
        Alert.alert('Success', 'Post created!');
      } else {
        Alert.alert('Error', result.error || 'Failed to create post');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
    setPosting(false);
  };

  const handleSelectMatch = (match) => {
    setShowScoreModal(false);
    navigation.navigate('SetScore', { match });
  };

  const getUserMatches = () => {
    return (matches || []).filter(m => 
      m.status !== 'completed' && 
      (m.creator?._id === user?._id || 
       m.players?.some(p => p._id === user?._id))
    );
  };

  // Match Modal State
  const [matchModalTab, setMatchModalTab] = useState('my');
  const [selectedMatchDate, setSelectedMatchDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState('all');

  const SPORTS_FILTER = ['All Sports', 'Football', 'Tennis', 'Basketball', 'Cricket'];

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateShort = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
    };
  };

  // Challenge Modal (Set Match) - like PWA ChallengeModal
  const renderMatchModal = () => (
    <Modal
      visible={showMatchModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMatchModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.matchModalContent}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.matchModalClose}
            onPress={() => setShowMatchModal(false)}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.matchModalTitle}>Past & Upcoming Matches</Text>

          {/* Tabs: My Matches / Friends Matches */}
          <View style={styles.matchModalTabs}>
            <TouchableOpacity
              style={[styles.matchModalTab, matchModalTab === 'my' && styles.matchModalTabActive]}
              onPress={() => setMatchModalTab('my')}
            >
              <Text style={[styles.matchModalTabText, matchModalTab === 'my' && styles.matchModalTabTextActive]}>
                My Matches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.matchModalTab, matchModalTab === 'friends' && styles.matchModalTabActive]}
              onPress={() => setMatchModalTab('friends')}
            >
              <Text style={[styles.matchModalTabText, matchModalTab === 'friends' && styles.matchModalTabTextActive]}>
                Friends Matches
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Selector */}
          <View style={styles.dateSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getWeekDates().map((date, index) => {
                const { day, date: dayNum } = formatDateShort(date);
                const isSelected = selectedMatchDate.toDateString() === date.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                    onPress={() => setSelectedMatchDate(date)}
                  >
                    <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>{day}</Text>
                    <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>{dayNum}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.calendarBtn}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Sport Filter */}
          <View style={styles.sportFilter}>
            <TouchableOpacity style={styles.sportFilterArrow}>
              <Ionicons name="chevron-back" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportFilterScroll}>
              {SPORTS_FILTER.map((sport, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.sportFilterItem, selectedSport === sport.toLowerCase().replace(' ', '') && styles.sportFilterItemActive]}
                  onPress={() => setSelectedSport(sport.toLowerCase().replace(' ', ''))}
                >
                  <Text style={styles.sportFilterText}>{sport}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.sportFilterArrow}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Matches List */}
          <View style={styles.matchesList}>
            {getUserMatches().length > 0 ? (
              getUserMatches().map((match) => (
                <TouchableOpacity
                  key={match._id}
                  style={styles.matchItem}
                  onPress={() => {
                    setShowMatchModal(false);
                    navigation.navigate('MatchDetail', { matchId: match._id });
                  }}
                >
                  <View style={styles.matchItemIcon}>
                    <Ionicons name="trophy" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.matchItemInfo}>
                    <Text style={styles.matchItemName}>{match.name}</Text>
                    <Text style={styles.matchItemMeta}>
                      {match.sport?.name} • {new Date(match.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noMatchesFound}>
                <Text style={styles.noMatchesText}>No matches found</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Score Modal - like PWA ScoreModal
  const renderScoreModal = () => (
    <Modal
      visible={showScoreModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowScoreModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Score</Text>
            <TouchableOpacity onPress={() => setShowScoreModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Score Type Toggle */}
          <View style={styles.scoreTypeToggle}>
            <TouchableOpacity
              style={[styles.scoreTypeBtn, scoreModalType === 'fisiko' && styles.scoreTypeBtnActive]}
              onPress={() => setScoreModalType('fisiko')}
            >
              <Text style={[styles.scoreTypeText, scoreModalType === 'fisiko' && styles.scoreTypeTextActive]}>
                Fisiko Matches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreTypeBtn, scoreModalType === 'non-fisiko' && styles.scoreTypeBtnActive]}
              onPress={() => setScoreModalType('non-fisiko')}
            >
              <Text style={[styles.scoreTypeText, scoreModalType === 'non-fisiko' && styles.scoreTypeTextActive]}>
                Non-Fisiko
              </Text>
            </TouchableOpacity>
          </View>

          {scoreModalType === 'fisiko' ? (
            <ScrollView style={styles.matchList}>
              {getUserMatches().length > 0 ? (
                getUserMatches().map((match) => (
                  <TouchableOpacity
                    key={match._id}
                    style={styles.matchItem}
                    onPress={() => handleSelectMatch(match)}
                  >
                    <View style={styles.matchItemIcon}>
                      <Ionicons name="trophy" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.matchItemInfo}>
                      <Text style={styles.matchItemName}>{match.name}</Text>
                      <Text style={styles.matchItemMeta}>
                        {match.sport?.name} • {new Date(match.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyMatches}>
                  <Ionicons name="trophy-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyMatchesText}>No active matches</Text>
                  <Text style={styles.emptyMatchesSubtext}>Create a match first to add scores</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.nonFisikoContainer}>
              <Ionicons name="create-outline" size={48} color={COLORS.primary} />
              <Text style={styles.nonFisikoText}>Add score for a match not on Fisiko</Text>
              <TouchableOpacity
                style={styles.nonFisikoBtn}
                onPress={() => {
                  setShowScoreModal(false);
                  Alert.alert('Coming Soon', 'Non-Fisiko match scoring will be available soon!');
                }}
              >
                <Text style={styles.nonFisikoBtnText}>Add External Score</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Create Post Bar - like PWA Header.js
  const renderCreatePostBar = () => (
    <View style={styles.createPostContainer}>
      {/* Input Row with Post Button */}
      <View style={styles.createPostInputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.postInput}
            placeholder="Game face on! What's on your mind?"
            placeholderTextColor={COLORS.textLight}
            value={postContent}
            onChangeText={setPostContent}
            multiline
          />
        </View>
        <TouchableOpacity
          style={[styles.postButton, (!postContent.trim() && !mediaFile) && styles.postButtonDisabled]}
          onPress={handlePostSubmit}
          disabled={(!postContent.trim() && !mediaFile) || posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Media Preview */}
      {mediaFile && (
        <View style={styles.mediaPreview}>
          <Image source={{ uri: mediaFile.uri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeMedia}
            onPress={() => setMediaFile(null)}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons Row - matching PWA */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={pickMedia}>
          <View style={styles.actionIconWrapper}>
            <Ionicons name="images" size={18} color="#4A90D9" />
          </View>
          <Text style={styles.actionButtonText}>Post/Reel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowMatchModal(true)}
        >
          <Text style={{ fontSize: 18 }}>🏀</Text>
          <Text style={styles.actionButtonText}>Set Match</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowScoreModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="#28A745" />
          <Text style={styles.actionButtonText}>Add Score</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStoriesOnly = () => (
    <StoriesBar
      stories={stories}
      onStoryPress={(story) => navigation.navigate('StoryViewer', { story })}
      onAddStory={() => navigation.navigate('CreateStory')}
      currentUser={user}
    />
  );

  const renderPost = ({ item }) => {
    if (!item || !item._id) {
      console.log('Invalid post item:', item);
      return null;
    }
    return (
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
        onProfilePress={() => navigation.navigate('UserProfile', { userId: item.creator?._id })}
        onCommentPress={() => navigation.navigate('Comments', { postId: item._id })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Fisiko</Text>
        <View style={styles.headerRight}>
          {/* Calendar Icon */}
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setShowMatchModal(true)}
          >
            <View style={styles.calendarIcon}>
              <Text style={styles.calendarMonth}>Jul</Text>
              <Text style={styles.calendarDay}>{new Date().getDate()}</Text>
            </View>
          </TouchableOpacity>

          {/* Notifications Bell */}
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color="#FFB800" />
            {notifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* LIVE Badge */}
          <TouchableOpacity
            style={styles.liveBadge}
            onPress={() => navigation.navigate('Search', { tab: 'scores' })}
          >
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Post Bar - moved outside FlatList to prevent keyboard dismissal */}
      {renderCreatePostBar()}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        ListHeaderComponent={renderStoriesOnly}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.emptyListContent : styles.listContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {renderMatchModal()}
      {renderScoreModal()}
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
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    fontStyle: 'italic',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    position: 'relative',
    padding: SPACING.xs,
  },
  calendarIcon: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarMonth: {
    fontSize: 8,
    color: '#EF4444',
    fontWeight: '600',
  },
  calendarDay: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  createPostContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.small,
  },
  createPostInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  postInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    minHeight: 36,
  },
  mediaPreview: {
    marginTop: SPACING.sm,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.md,
  },
  removeMedia: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconWrapper: {
    marginRight: SPACING.xs,
  },
  actionButtonText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xxl,
  },
  modalBody: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  createMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  createMatchBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  scoreTypeToggle: {
    flexDirection: 'row',
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
  },
  scoreTypeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  scoreTypeBtnActive: {
    backgroundColor: COLORS.text,
  },
  scoreTypeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  scoreTypeTextActive: {
    color: COLORS.white,
  },
  matchList: {
    paddingHorizontal: SPACING.lg,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  emptyMatches: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyMatchesText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyMatchesSubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  nonFisikoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  nonFisikoText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  nonFisikoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  nonFisikoBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  // Match Modal Styles
  matchModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '70%',
  },
  matchModalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.xs,
  },
  matchModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  matchModalTabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  matchModalTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  matchModalTabActive: {
    backgroundColor: COLORS.text,
  },
  matchModalTabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  matchModalTabTextActive: {
    color: COLORS.white,
  },
  dateSelector: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  dateItemSelected: {
    backgroundColor: COLORS.text,
  },
  dateDay: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateDaySelected: {
    color: COLORS.white,
  },
  dateNum: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateNumSelected: {
    color: COLORS.white,
  },
  calendarBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  sportFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sportFilterArrow: {
    padding: SPACING.xs,
  },
  sportFilterScroll: {
    flex: 1,
  },
  sportFilterItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  sportFilterItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.text,
  },
  sportFilterText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  matchesList: {
    paddingHorizontal: SPACING.lg,
  },
  noMatchesFound: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noMatchesText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
