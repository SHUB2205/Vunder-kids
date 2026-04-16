import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import SportsNews from '../../components/Home/SportsNews';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

// News card injected every N posts
const NEWS_INJECT_EVERY = 4;

const NewsCard = ({ item, onPress }) => {
  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (item.itemType === 'score') {
    return (
      <TouchableOpacity style={styles.scoreCard} onPress={onPress} activeOpacity={0.85}>
        {item.isLive && (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveChipText}>LIVE</Text>
          </View>
        )}
        <Text style={styles.scoreCardLeague}>{item.league}</Text>
        <View style={styles.scoreCardTeams}>
          <View style={styles.scoreCardTeam}>
            <Text style={styles.scoreCardTeamLogo}>{item.homeTeam?.logo || '🏟️'}</Text>
            <Text style={styles.scoreCardTeamName} numberOfLines={1}>{item.homeTeam?.name}</Text>
            <Text style={styles.scoreCardScore}>{item.homeTeam?.score ?? '-'}</Text>
          </View>
          <Text style={styles.scoreCardVs}>VS</Text>
          <View style={styles.scoreCardTeam}>
            <Text style={styles.scoreCardTeamLogo}>{item.awayTeam?.logo || '🏟️'}</Text>
            <Text style={styles.scoreCardTeamName} numberOfLines={1}>{item.awayTeam?.name}</Text>
            <Text style={styles.scoreCardScore}>{item.awayTeam?.score ?? '-'}</Text>
          </View>
        </View>
        {item.quarter && <Text style={styles.scoreCardQuarter}>{item.quarter}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.newsCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.newsCardRow}>
        <View style={styles.newsCardContent}>
          <View style={styles.newsCardMeta}>
            <View style={styles.sportChip}>
              <Text style={styles.sportChipText}>{item.sport || 'Sports'}</Text>
            </View>
            {item.source && <Text style={styles.newsSource}>{item.source}</Text>}
          </View>
          <Text style={styles.newsCardTitle} numberOfLines={3}>{item.title}</Text>
          <Text style={styles.newsCardTime}>{item.publishedAt ? timeAgo(item.publishedAt) : 'Today'}</Text>
        </View>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.newsCardImage} />
        ) : (
          <View style={[styles.newsCardImage, styles.newsCardImagePlaceholder]}>
            <Ionicons name="newspaper-outline" size={28} color={COLORS.textLight} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

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
  const [selectedPostSport, setSelectedPostSport] = useState(null);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [availableSports, setAvailableSports] = useState([]);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);

  // News data
  const [news, setNews] = useState([]);
  const [liveScores, setLiveScores] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);
  const [showNewsDetail, setShowNewsDetail] = useState(false);

  useEffect(() => {
    loadData();
    connectSocket();
    fetchMatches();
    fetchNews();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPosts(), fetchStories(), fetchSports()]);
    setLoading(false);
  };

  const fetchSports = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_SPORTS);
      setAvailableSports(res.data.sports || res.data || []);
    } catch { }
  };

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const [newsRes, scoresRes] = await Promise.all([
        api.get(API_ENDPOINTS.GET_NEWS),
        api.get(API_ENDPOINTS.GET_NEWS_SCORES),
      ]);
      setNews(newsRes.data.news || []);
      setLiveScores(scoresRes.data.scores || []);
    } catch (e) {
      // Silent fail - news is non-critical
    }
    setNewsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchStories(), fetchMatches(), fetchNews()]);
    setRefreshing(false);
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setMediaFile(result.assets[0]);
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !mediaFile) return;
    setPosting(true);
    try {
      const result = await createPost({
        content: postContent,
        ...(mediaFile ? { media: mediaFile } : {}),
        ...(selectedPostSport ? { sport: selectedPostSport } : {}),
      });
      if (result.success) { setPostContent(''); setMediaFile(null); setSelectedPostSport(null); }
      else Alert.alert('Error', result.error || 'Failed to create post');
    } catch { Alert.alert('Error', 'Failed to create post'); }
    setPosting(false);
  };

  const handleSelectMatch = (match) => {
    setShowScoreModal(false);
    navigation.navigate('SetScore', { match });
  };

  const getUserMatches = () => (matches || []).filter(m =>
    m.status !== 'completed' &&
    (m.creator?._id === user?._id || m.players?.some(p => p._id === user?._id))
  );

  // Build mixed feed: posts with news + scores interleaved every N items
  const buildMixedFeed = () => {
    const liveScoreItems = liveScores
      .filter(s => s.status === 'LIVE')
      .map(s => ({ ...s, itemType: 'score', isLive: true, _id: `score_${s.id || Math.random()}` }));
    const newsArticles = news.map(n => ({ ...n, itemType: 'news', _id: `news_${n.id || Math.random()}` }));
    const nonLiveScores = liveScores
      .filter(s => s.status !== 'LIVE')
      .map(s => ({ ...s, itemType: 'score', isLive: false, _id: `score2_${s.id || Math.random()}` }));

    // Interleave: alternate between news articles and scores
    const combined = [];
    const maxLen = Math.max(liveScoreItems.length, newsArticles.length, nonLiveScores.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < liveScoreItems.length) combined.push(liveScoreItems[i]);
      if (i < newsArticles.length) combined.push(newsArticles[i]);
      if (i < nonLiveScores.length) combined.push(nonLiveScores[i]);
    }

    const mixed = [];
    let injectIdx = 0;
    posts.forEach((post, idx) => {
      mixed.push({ ...post, feedType: 'post' });
      if ((idx + 1) % NEWS_INJECT_EVERY === 0 && injectIdx < combined.length) {
        mixed.push({ ...combined[injectIdx], feedType: 'news' });
        injectIdx++;
      }
    });
    // If few/no posts, show some news + scores at the top
    if (posts.length < NEWS_INJECT_EVERY && combined.length > 0) {
      combined.slice(0, 4).forEach(n => {
        if (!mixed.find(m => m._id === n._id)) mixed.unshift({ ...n, feedType: 'news' });
      });
    }
    return mixed;
  };

  const mixedFeed = buildMixedFeed();

  // Match Modal state
  const [matchModalTab, setMatchModalTab] = useState('my');
  const [selectedMatchDate, setSelectedMatchDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState('all');
  const SPORTS_FILTER = ['All Sports', 'Football', 'Tennis', 'Basketball', 'Cricket'];

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const renderMatchModal = () => (
    <Modal visible={showMatchModal} animationType="slide" transparent onRequestClose={() => setShowMatchModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.matchModalContent}>
          <TouchableOpacity style={styles.matchModalClose} onPress={() => setShowMatchModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.matchModalTitle}>My Matches</Text>
          <TouchableOpacity
            style={styles.createMatchButton}
            onPress={() => { setShowMatchModal(false); navigation.navigate('Matches', { screen: 'CreateMatch' }); }}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.createMatchButtonText}>Set New Match</Text>
          </TouchableOpacity>

          <View style={styles.matchModalTabs}>
            {['my', 'friends'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.matchModalTab, matchModalTab === tab && styles.matchModalTabActive]}
                onPress={() => setMatchModalTab(tab)}
              >
                <Text style={[styles.matchModalTabText, matchModalTab === tab && styles.matchModalTabTextActive]}>
                  {tab === 'my' ? 'My Matches' : 'Friends'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.matchesList}>
            {getUserMatches().length > 0 ? getUserMatches().map(match => (
              <TouchableOpacity
                key={match._id}
                style={styles.matchItem}
                onPress={() => { setShowMatchModal(false); navigation.navigate('MatchDetail', { matchId: match._id }); }}
              >
                <View style={styles.matchItemIcon}>
                  <Ionicons name="trophy" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.matchItemInfo}>
                  <Text style={styles.matchItemName}>{match.name}</Text>
                  <Text style={styles.matchItemMeta}>{match.sport?.name} • {new Date(match.date).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )) : (
              <View style={styles.noMatchesFound}>
                <Ionicons name="trophy-outline" size={40} color={COLORS.textLight} />
                <Text style={styles.noMatchesText}>No matches yet</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderScoreModal = () => (
    <Modal visible={showScoreModal} animationType="slide" transparent onRequestClose={() => setShowScoreModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Score</Text>
            <TouchableOpacity onPress={() => setShowScoreModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.matchList}>
            {getUserMatches().length > 0 ? getUserMatches().map(match => (
              <TouchableOpacity key={match._id} style={styles.matchItem} onPress={() => handleSelectMatch(match)}>
                <View style={styles.matchItemIcon}>
                  <Ionicons name="trophy" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.matchItemInfo}>
                  <Text style={styles.matchItemName}>{match.name}</Text>
                  <Text style={styles.matchItemMeta}>{match.sport?.name} • {new Date(match.date).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyMatches}>
                <Ionicons name="trophy-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyMatchesText}>No active matches</Text>
                <Text style={styles.emptyMatchesSubtext}>Create a match first to add scores</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderCreatePostBar = () => (
    <View style={styles.createPostContainer}>
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
          {posting ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.postButtonText}>Post</Text>}
        </TouchableOpacity>
      </View>

      {mediaFile && (
        <View style={styles.mediaPreview}>
          <Image source={{ uri: mediaFile.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeMedia} onPress={() => setMediaFile(null)}>
            <Ionicons name="close-circle" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {selectedPostSport && (
        <TouchableOpacity
          style={styles.selectedSportChip}
          onPress={() => setSelectedPostSport(null)}
        >
          <Text style={styles.selectedSportChipText}>⚽ {selectedPostSport}</Text>
          <Ionicons name="close-circle" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={pickMedia}>
          <Ionicons name="images" size={17} color="#4A90D9" />
          <Text style={styles.actionButtonText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowSportPicker(true)}>
          <Text style={{ fontSize: 14 }}>⚽</Text>
          <Text style={styles.actionButtonText}>Sport</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowMatchModal(true)}>
          <Text style={{ fontSize: 14 }}>🏆</Text>
          <Text style={styles.actionButtonText}>Match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowScoreModal(true)}>
          <Ionicons name="add-circle" size={16} color="#28A745" />
          <Text style={styles.actionButtonText}>Score</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeedItem = ({ item }) => {
    if (item.feedType === 'news') {
      return (
        <NewsCard
          item={item}
          onPress={() => { setSelectedNewsItem(item); setShowNewsDetail(true); }}
        />
      );
    }
    if (!item || !item._id) return null;
    return (
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
        onProfilePress={() => navigation.navigate('UserProfile', { userId: item.creator?._id })}
        onCommentPress={() => navigation.navigate('Comments', { postId: item._id })}
      />
    );
  };

  const renderListHeader = () => (
    <View>
      <StoriesBar
        stories={stories}
        onStoryPress={(story) => navigation.navigate('StoryViewer', { story })}
        onAddStory={() => navigation.navigate('CreateStory')}
        currentUser={user}
      />
      {/* News Header Card */}
      <TouchableOpacity style={styles.newsHeaderCard} onPress={() => setShowNewsModal(true)}>
        <View style={styles.newsHeaderLeft}>
          <View style={styles.newsHeaderIcon}>
            <Ionicons name="newspaper" size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.newsHeaderTitle}>Sports News & Live Scores</Text>
            <Text style={styles.newsHeaderSub}>Tap to explore all news</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image source={require('../../../assets/Fisiko_logo-noBG.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setShowMatchModal(true)}>
            <View style={styles.calendarIcon}>
              <Text style={styles.calendarMonth}>{new Date().toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
              <Text style={styles.calendarDay}>{new Date().getDate()}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={24} color="#FFB800" />
            {notifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.liveBadge} onPress={() => setShowNewsModal(true)}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>NEWS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showNewsModal} animationType="slide" onRequestClose={() => setShowNewsModal(false)}>
        <SafeAreaView style={{ flex: 1 }}>
          <SportsNews onClose={() => setShowNewsModal(false)} />
        </SafeAreaView>
      </Modal>

      {/* News Detail Modal */}
      <Modal visible={showNewsDetail} transparent animationType="fade" onRequestClose={() => setShowNewsDetail(false)}>
        <TouchableOpacity style={styles.newsDetailOverlay} activeOpacity={1} onPress={() => setShowNewsDetail(false)}>
          <View style={styles.newsDetailCard}>
            <TouchableOpacity style={styles.newsDetailClose} onPress={() => setShowNewsDetail(false)}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </TouchableOpacity>
            {selectedNewsItem?.itemType === 'news' ? (
              <>
                {selectedNewsItem?.imageUrl && <Image source={{ uri: selectedNewsItem.imageUrl }} style={styles.newsDetailImg} />}
                <View style={styles.newsDetailBody}>
                  <View style={styles.sportChip}><Text style={styles.sportChipText}>{selectedNewsItem?.sport}</Text></View>
                  <Text style={styles.newsDetailTitle}>{selectedNewsItem?.title}</Text>
                  <Text style={styles.newsDetailSummary}>{selectedNewsItem?.summary}</Text>
                  {selectedNewsItem?.source && <Text style={styles.newsDetailSource}>— {selectedNewsItem.source}</Text>}
                </View>
              </>
            ) : (
              <View style={styles.newsDetailBody}>
                <Text style={styles.newsDetailLeague}>{selectedNewsItem?.league}</Text>
                {selectedNewsItem?.isLive && (
                  <View style={styles.liveChip}><View style={styles.liveDot} /><Text style={styles.liveChipText}>LIVE</Text></View>
                )}
                <View style={styles.scoreDetailTeams}>
                  <View style={styles.scoreDetailTeam}>
                    <Text style={{ fontSize: 36 }}>{selectedNewsItem?.homeTeam?.logo || '🏟️'}</Text>
                    <Text style={styles.scoreDetailName}>{selectedNewsItem?.homeTeam?.name}</Text>
                    <Text style={styles.scoreDetailBigScore}>{selectedNewsItem?.homeTeam?.score ?? '-'}</Text>
                  </View>
                  <Text style={styles.scoreDetailVs}>VS</Text>
                  <View style={styles.scoreDetailTeam}>
                    <Text style={{ fontSize: 36 }}>{selectedNewsItem?.awayTeam?.logo || '🏟️'}</Text>
                    <Text style={styles.scoreDetailName}>{selectedNewsItem?.awayTeam?.name}</Text>
                    <Text style={styles.scoreDetailBigScore}>{selectedNewsItem?.awayTeam?.score ?? '-'}</Text>
                  </View>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.viewAllNewsBtn} onPress={() => { setShowNewsDetail(false); setShowNewsModal(true); }}>
              <Text style={styles.viewAllNewsText}>View All News & Scores</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {renderCreatePostBar()}

      {/* Sport Picker Modal for quick post */}
      <Modal visible={showSportPicker} transparent animationType="slide" onRequestClose={() => setShowSportPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tag a Sport</Text>
              <TouchableOpacity onPress={() => setShowSportPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: SPACING.md }}>
              {availableSports.map((sport, i) => (
                <TouchableOpacity
                  key={sport._id || i}
                  style={[styles.matchItem, selectedPostSport === sport.name && { backgroundColor: COLORS.primary + '10' }]}
                  onPress={() => { setSelectedPostSport(sport.name); setShowSportPicker(false); }}
                >
                  <Text style={{ fontSize: 22, marginRight: SPACING.md }}>⚽</Text>
                  <Text style={[styles.matchItemName, selectedPostSport === sport.name && { color: COLORS.primary }]}>{sport.name}</Text>
                  {selectedPostSport === sport.name && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        data={mixedFeed}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        ListHeaderComponent={renderListHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={mixedFeed.length === 0 ? styles.emptyListContent : styles.listContent}
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
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  logoImage: { width: 100, height: 40 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerIcon: { position: 'relative', padding: SPACING.xs },
  calendarIcon: { backgroundColor: COLORS.white, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  calendarMonth: { fontSize: 8, color: '#EF4444', fontWeight: '600' },
  calendarDay: { fontSize: 14, color: COLORS.text, fontWeight: 'bold', marginTop: -2 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.error, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#EF4444' },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 4 },
  liveText: { fontSize: 12, fontWeight: 'bold', color: '#EF4444' },

  // Create Post Bar
  createPostContainer: { backgroundColor: COLORS.white, marginHorizontal: SPACING.md, marginTop: SPACING.xs, borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm, ...SHADOWS.small },
  createPostInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  inputWrapper: { flex: 1, marginRight: SPACING.sm },
  postInput: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.sizes.sm, color: COLORS.text, minHeight: 36 },
  mediaPreview: { marginTop: SPACING.sm, position: 'relative' },
  previewImage: { width: '100%', height: 150, borderRadius: BORDER_RADIUS.md },
  removeMedia: { position: 'absolute', top: SPACING.xs, right: SPACING.xs, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  postButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, minWidth: 60, alignItems: 'center' },
  postButtonDisabled: { opacity: 0.5 },
  postButtonText: { color: COLORS.white, fontWeight: '600', fontSize: FONTS.sizes.md },
  selectedSportChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, marginBottom: SPACING.xs, gap: 4 },
  selectedSportChipText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: SPACING.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  actionButtonText: { fontSize: FONTS.sizes.xs, fontWeight: '500', color: COLORS.text },

  // News Header Card
  newsHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  newsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  newsHeaderIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  newsHeaderTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  newsHeaderSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // Google News style card
  newsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  newsCardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  newsCardContent: { flex: 1, paddingRight: SPACING.sm },
  newsCardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, gap: SPACING.xs },
  sportChip: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  sportChipText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },
  newsSource: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '500' },
  newsCardTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, lineHeight: 20, marginBottom: SPACING.xs },
  newsCardTime: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  newsCardImage: { width: 90, height: 80, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface },
  newsCardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },

  // Score Card (Google News score style)
  scoreCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  liveChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, marginBottom: SPACING.xs, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
  liveChipText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '700' },
  scoreCardLeague: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.sm },
  scoreCardTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  scoreCardTeam: { flex: 1, alignItems: 'center' },
  scoreCardTeamLogo: { fontSize: 28, marginBottom: 4 },
  scoreCardTeamName: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  scoreCardScore: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.primary },
  scoreCardVs: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  scoreCardQuarter: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },

  // List
  listContent: { paddingBottom: 100 },
  emptyListContent: { flexGrow: 1, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginTop: SPACING.md },
  emptySubtext: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.xs },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xxl, borderTopRightRadius: BORDER_RADIUS.xxl, maxHeight: '80%', paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  matchList: { paddingHorizontal: SPACING.lg },
  matchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  matchItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  matchItemInfo: { flex: 1, marginLeft: SPACING.md },
  matchItemName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  matchItemMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  emptyMatches: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyMatchesText: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginTop: SPACING.md },
  emptyMatchesSubtext: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.xs },

  // Match Modal
  matchModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl, maxHeight: '70%' },
  matchModalClose: { position: 'absolute', top: SPACING.md, right: SPACING.md, zIndex: 10, padding: SPACING.xs },
  matchModalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md, paddingHorizontal: SPACING.xl },
  createMatchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm },
  createMatchButtonText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
  matchModalTabs: { flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.full, padding: 4 },
  matchModalTab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.full },
  matchModalTabActive: { backgroundColor: COLORS.text },
  matchModalTabText: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.textSecondary },
  matchModalTabTextActive: { color: COLORS.white },
  matchesList: { paddingHorizontal: SPACING.lg },
  noMatchesFound: { alignItems: 'center', paddingVertical: SPACING.xl },
  noMatchesText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm },

  // News Detail Modal
  newsDetailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  newsDetailCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, width: '100%', maxWidth: 380, overflow: 'hidden' },
  newsDetailClose: { position: 'absolute', top: SPACING.md, right: SPACING.md, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  newsDetailImg: { width: '100%', height: 180 },
  newsDetailBody: { padding: SPACING.lg },
  newsDetailTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  newsDetailSummary: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  newsDetailSource: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  newsDetailLeague: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.sm },
  scoreDetailTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: SPACING.md },
  scoreDetailTeam: { flex: 1, alignItems: 'center' },
  scoreDetailName: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginTop: 4 },
  scoreDetailBigScore: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  scoreDetailVs: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textSecondary },
  viewAllNewsBtn: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, alignItems: 'center' },
  viewAllNewsText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default HomeScreen;
