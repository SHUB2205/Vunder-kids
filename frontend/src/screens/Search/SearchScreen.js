import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

// Sport categories for Scores tab - matching PWA Search.js sportsScoreTabs
const SPORT_CATEGORIES = [
  { id: 'cricket', label: 'Cricket', emoji: '🏏' },
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  { id: 'rugby', label: 'Rugby', emoji: '🏉' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'table-tennis', label: 'TableTennis', emoji: '🏓' },
  { id: 'basketball', label: 'BasketBall', emoji: '🏀' },
];

// Status filters for scores - matching PWA LiveScore.js tabs
const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'finished', label: 'Finished' },
  { id: 'upcoming', label: 'Upcoming' },
];

// Top search items - matching PWA Search.js topSearchItems
const TOP_SEARCH_ITEMS = [
  { label: 'Football', emoji: '⚽' },
  { label: 'Cricket', emoji: '🏏' },
  { label: 'BasketBall', emoji: '🏀' },
  { label: 'Tennis', emoji: '🎾' },
  { label: 'Padel', emoji: '🎾' },
  { label: 'Badminton', emoji: '🏸' },
];

const SearchScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  // Main tabs: search, foryou, news, scores - matching PWA Search.js
  const [activeTab, setActiveTab] = useState('search');
  const [scoreTab, setScoreTab] = useState('cricket');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search results state
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  
  // News state
  const [news, setNews] = useState([]);
  
  // Scores state
  const [liveMatches, setLiveMatches] = useState([]);
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [activeStatus, setActiveStatus] = useState('live');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch news - matching PWA News.js
  const fetchNews = async (query) => {
    try {
      const searchTerm = query || searchQuery || 'sports';
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=pub_65848a3c28fb4c17ca801f2818b6538c7bfd8&q=${searchTerm}&category=sports&language=en`
      );
      const data = await response.json();
      if (data.status === 'success' && data.results) {
        setNews(data.results);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    }
  };

  // Fetch live scores - matching PWA LiveScore.js
  const fetchLiveScores = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_LIVE_SCORES(scoreTab));
      setLiveMatches(response.data.events || []);
    } catch (error) {
      console.error('Error fetching live scores:', error);
      setLiveMatches([]);
    }
  };

  // Fetch scheduled scores
  const fetchScheduledScores = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await api.get(API_ENDPOINTS.GET_SCHEDULED_SCORES(scoreTab, formattedDate));
      setScheduledMatches(response.data.events || []);
    } catch (error) {
      console.error('Error fetching scheduled scores:', error);
      setScheduledMatches([]);
    }
  };

  // Search users and posts - matching PWA Search.js
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
      setSearchResults({
        users: response.data.users || [],
        posts: response.data.posts || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ users: [], posts: [] });
    }
    setLoading(false);
  }, []);

  // Handle search input - matching PWA Search.js handleSearchInput
  const handleSearchInput = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveTab('foryou');
      setTimeout(() => performSearch(query), 300);
    } else {
      setActiveTab('search');
      setSearchResults({ users: [], posts: [] });
    }
  };

  // Handle search item click - matching PWA Search.js
  const handleSearchItemClick = (label) => {
    setSearchQuery(label);
    setActiveTab('foryou');
    setScoreTab(label.toLowerCase());
    performSearch(label);
  };

  // Effect for scores tab
  useEffect(() => {
    if (activeTab === 'scores') {
      setLoading(true);
      Promise.all([fetchLiveScores(), fetchScheduledScores()])
        .finally(() => setLoading(false));
    }
  }, [activeTab, scoreTab, selectedDate]);

  // Effect for news tab
  useEffect(() => {
    if (activeTab === 'news') {
      setLoading(true);
      fetchNews(searchQuery).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'scores') {
      await Promise.all([fetchLiveScores(), fetchScheduledScores()]);
    } else if (activeTab === 'news') {
      await fetchNews(searchQuery);
    } else {
      await performSearch(searchQuery);
    }
    setRefreshing(false);
  };

  // Date navigation for scores
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Get display matches based on status filter
  const getDisplayMatches = () => {
    switch (activeStatus) {
      case 'live':
        return liveMatches;
      case 'finished':
        return scheduledMatches.filter(m => m.status?.type === 'finished');
      case 'upcoming':
        return scheduledMatches.filter(m => m.status?.type === 'notstarted');
      default:
        return [...liveMatches, ...scheduledMatches];
    }
  };

  // Render user result - matching PWA People.js
  const renderUserResult = (item) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userHandle}>@{item.userName}</Text>
        <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
      </View>
      <TouchableOpacity style={styles.followBtn}>
        <Text style={styles.followBtnText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render news item - matching PWA News.js
  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => item.link && Linking.openURL(item.link)}
    >
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        {item.description && (
          <Text style={styles.newsDescription} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.newsMeta}>
          <Text style={styles.newsDate}>
            {new Date(item.pubDate).toLocaleDateString()}
          </Text>
          <Text style={styles.newsSource}>{item.source_name}</Text>
        </View>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.newsImage} />
      )}
    </TouchableOpacity>
  );

  // Render score item - matching PWA LiveScore.js
  const renderScoreItem = ({ item }) => {
    const isLive = item.status?.type === 'inprogress';
    const isNotStarted = item.status?.type === 'notstarted';
    
    return (
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.tournamentName}>{item.tournament?.name}</Text>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {isNotStarted ? (
          <View style={styles.teamsRow}>
            <Text style={styles.teamName}>{item.homeTeam?.shortName}</Text>
            <Text style={styles.vsText}>vs</Text>
            <Text style={styles.teamName}>{item.awayTeam?.shortName}</Text>
          </View>
        ) : (
          <View style={styles.teamsContainer}>
            <View style={styles.teamRow}>
              <Text style={styles.teamName}>{item.homeTeam?.shortName}</Text>
              <Text style={styles.teamScore}>
                {item.homeScore?.innings?.inning1 
                  ? `${item.homeScore.innings.inning1.score}-${item.homeScore.innings.inning1.wickets}`
                  : item.homeScore?.current || '-'}
              </Text>
            </View>
            <View style={styles.teamRow}>
              <Text style={styles.teamName}>{item.awayTeam?.shortName}</Text>
              <Text style={styles.teamScore}>
                {item.awayScore?.innings?.inning1 
                  ? `${item.awayScore.innings.inning1.score}-${item.awayScore.innings.inning1.wickets}`
                  : item.awayScore?.current || '-'}
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.matchStatus, isLive && styles.matchStatusLive]}>
          {item.status?.description}
        </Text>
      </View>
    );
  };

  // Render default content (Top Search) - matching PWA Search.js
  const renderDefaultContent = () => (
    <View style={styles.defaultContent}>
      <Text style={styles.heading}>Top Search</Text>
      <View style={styles.gridContainer}>
        {TOP_SEARCH_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.searchItem}
            onPress={() => handleSearchItemClick(item.label)}
          >
            <View style={styles.searchItemIcon}>
              <Text style={styles.searchItemEmoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.searchItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render For You tab - matching PWA ForYou.js
  const renderForYouTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {searchResults.users.length > 0 && (
        <View style={styles.section}>
          {searchResults.users.map((u) => (
            <View key={u._id}>{renderUserResult(u)}</View>
          ))}
        </View>
      )}
      
      {searchResults.posts.length > 0 && (
        <View style={styles.section}>
          {searchResults.posts.map((post) => (
            <TouchableOpacity
              key={post._id}
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetail', { post })}
            >
              {post.mediaURL && (
                <Image source={{ uri: post.mediaURL }} style={styles.postImage} />
              )}
              <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
        </View>
      )}
    </ScrollView>
  );

  // Render News tab - matching PWA News.js
  const renderNewsTab = () => (
    <FlatList
      data={news}
      renderItem={renderNewsItem}
      keyExtractor={(item, index) => item.article_id || index.toString()}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No news found</Text>
        </View>
      }
    />
  );

  // Render Scores tab - matching PWA LiveScore.js
  const renderScoresTab = () => (
    <View style={styles.scoresContainer}>
      {/* Sport categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportCategoriesScroll}
        contentContainerStyle={styles.sportCategoriesContent}
      >
        {SPORT_CATEGORIES.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportCategory,
              scoreTab === sport.id && styles.sportCategoryActive,
            ]}
            onPress={() => setScoreTab(sport.id)}
          >
            <Text style={styles.sportCategoryEmoji}>{sport.emoji}</Text>
            <Text style={[
              styles.sportCategoryLabel,
              scoreTab === sport.id && styles.sportCategoryLabelActive,
            ]}>{sport.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Status filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFiltersScroll}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.statusFilter,
              activeStatus === status.id && styles.statusFilterActive,
            ]}
            onPress={() => setActiveStatus(status.id)}
          >
            <Text style={[
              styles.statusFilterText,
              activeStatus === status.id && styles.statusFilterTextActive,
            ]}>
              {status.label}
              {status.id === 'live' && liveMatches.length > 0 && ` (${liveMatches.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scores list */}
      <FlatList
        data={getDisplayMatches()}
        renderItem={renderScoreItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.scoresList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scores available</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.topHeader}>
        <View style={styles.searchHeader}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchInput('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Show tabs only when there's a search query - matching PWA */}
      {searchQuery ? (
        <>
          {/* Main Tabs: For you, News, Scores - matching PWA Search.js */}
          <View style={styles.mainTabs}>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === 'foryou' && styles.mainTabActive]}
              onPress={() => setActiveTab('foryou')}
            >
              <Text style={[styles.mainTabText, activeTab === 'foryou' && styles.mainTabTextActive]}>For you</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === 'news' && styles.mainTabActive]}
              onPress={() => setActiveTab('news')}
            >
              <Text style={[styles.mainTabText, activeTab === 'news' && styles.mainTabTextActive]}>News</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === 'scores' && styles.mainTabActive]}
              onPress={() => setActiveTab('scores')}
            >
              <Text style={[styles.mainTabText, activeTab === 'scores' && styles.mainTabTextActive]}>Scores</Text>
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {activeTab === 'foryou' && renderForYouTab()}
              {activeTab === 'news' && renderNewsTab()}
              {activeTab === 'scores' && renderScoresTab()}
            </>
          )}
        </>
      ) : (
        renderDefaultContent()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  // Main Tabs
  mainTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mainTab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: COLORS.primary,
  },
  mainTabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  mainTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  section: {
    padding: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  // Default Content
  defaultContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  heading: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  searchItemIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchItemEmoji: {
    fontSize: 32,
  },
  searchItemLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userHandle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  userBio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  followBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  // Post Card
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  postImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.surface,
  },
  postContent: {
    padding: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  // News Card
  newsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  newsContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  newsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  newsDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  newsSource: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  newsImage: {
    width: 100,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  // Scores
  scoresContainer: {
    flex: 1,
  },
  sportCategoriesScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 50,
  },
  sportCategoriesContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sportCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sportCategoryActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  sportCategoryEmoji: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  sportCategoryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  sportCategoryLabelActive: {
    color: COLORS.white,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  dateArrow: {
    padding: SPACING.sm,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  dateText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  statusFiltersScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 50,
  },
  statusFiltersContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statusFilter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  statusFilterActive: {
    backgroundColor: '#EF4444' + '20',
  },
  statusFilterText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statusFilterTextActive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  scoresList: {
    padding: SPACING.md,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tournamentName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444' + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: SPACING.xs,
  },
  liveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: '#EF4444',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  vsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginHorizontal: SPACING.md,
  },
  teamsContainer: {
    marginBottom: SPACING.sm,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  teamName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  teamScore: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchStatus: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  matchStatusLive: {
    color: '#EF4444',
  },
});

export default SearchScreen;
