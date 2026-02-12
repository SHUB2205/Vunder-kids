import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

// Match PWA MatchesComponent.js sports
const SPORT_TYPES = ['All', 'Football', 'Tennis', 'Cricket', 'Basketball', 'Soccer'];
const STATUS_TABS = ['All Matches', 'Upcoming', 'Completed'];

const MatchesScreen = ({ navigation }) => {
  const { matches, fetchMatches, loading, toggleLike } = useMatch();
  const { user } = useAuth();
  
  // Filters - matching PWA MatchesComponent.js
  const [activeFilters, setActiveFilters] = useState({
    matchType: '1 on 1',
    sportType: 'All',
  });
  const [locationSearch, setLocationSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showMyMatches, setShowMyMatches] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState('All Matches');

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  // Filter matches - exactly like PWA filterMatches function
  const filterMatches = () => {
    if (!matches) return [];
    
    return matches.filter(match => {
      // My Matches filter
      if (showMyMatches && user) {
        const isMyMatch = 
          match.creator?._id === user._id || 
          match.players?.some(p => p._id === user._id) ||
          match.teams?.some(t => t.players?.some(p => p._id === user._id));
        if (!isMyMatch) return false;
      }

      // Status filter
      if (activeStatusTab === 'Upcoming') {
        if (match.status !== 'scheduled' && match.status !== 'in-progress') return false;
      } else if (activeStatusTab === 'Completed') {
        if (match.status !== 'completed') return false;
      }

      // Match type filter (1 on 1 vs Team)
      const matchTypeFilter = 
        activeFilters.matchType === '1 on 1' ? !match.isTeamMatch : match.isTeamMatch;

      // Sport type filter
      const sportTypeFilter = 
        activeFilters.sportType === 'All' || 
        match.sport?.name?.toLowerCase() === activeFilters.sportType.toLowerCase();

      // Location filter
      const locationFilter = 
        locationSearch.trim() === '' || 
        match.location?.toLowerCase().includes(locationSearch.toLowerCase());

      return matchTypeFilter && sportTypeFilter && locationFilter;
    });
  };

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Like match - like PWA MatchCardPost.js handleLike
  const handleLikeMatch = async (matchId) => {
    if (toggleLike) {
      await toggleLike(matchId);
    }
  };

  const handleShareMatch = (match) => {
    Alert.alert('Share', `Share ${match.name} with your friends!`);
  };

  const filteredMatches = filterMatches();

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Match Card - like PWA MatchCardPost.js
  const renderMatchCard = ({ item }) => {
    const player1 = item.players?.[0] || item.creator;
    const player2 = item.players?.[1];
    const isLiked = item.likes?.includes(user?._id);
    
    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
        activeOpacity={0.9}
      >
        {/* Header - like PWA postHeader */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: player1?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{player1?.userName || player1?.name || 'Player'}</Text>
            <Text style={styles.postTime}>Upcoming Match</Text>
          </View>
        </View>

        {/* Post Content - like PWA postContent */}
        <Text style={styles.postContent}>
          {player1?.userName || player1?.name || 'Player 1'} vs {player2?.userName || player2?.name || '?'} in an exciting {item.sport?.name || 'Sport'} match!
        </Text>

        {/* Match Card Inner */}
        <View style={styles.matchCardInner}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchType}>{item.isTeamMatch ? 'Team' : '1 on 1'}</Text>
            <Text style={styles.matchLocation}>
              <Ionicons name="location" size={12} color={COLORS.textSecondary} /> {item.location || 'TBD'}
            </Text>
          </View>

          {/* Players */}
          <View style={styles.playersRow}>
            <View style={styles.playerCard}>
              <Image
                source={{ uri: player1?.avatar || 'https://via.placeholder.com/50' }}
                style={styles.playerAvatar}
              />
              <Text style={styles.playerName}>{player1?.userName || player1?.name || 'Player 1'}</Text>
            </View>
            
            <Text style={styles.vsText}>VS</Text>
            
            <View style={styles.playerCard}>
              <Image
                source={{ uri: player2?.avatar || 'https://via.placeholder.com/50' }}
                style={styles.playerAvatar}
              />
              <Text style={styles.playerName}>{player2?.userName || player2?.name || '?'}</Text>
            </View>
          </View>

          {/* Sport and Date */}
          <View style={styles.matchMeta}>
            <Text style={styles.sportName}>{item.sport?.name || 'Sport'}</Text>
            <Text style={styles.matchDate}>{formatDate(item.date)}</Text>
          </View>
        </View>

        {/* Footer - like PWA postFooter */}
        <View style={styles.postFooter}>
          <View style={styles.likeSection}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => handleLikeMatch(item._id)}
            >
              <Ionicons 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isLiked ? '#FA2A55' : COLORS.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareMatch(item)}>
              <Ionicons name="share-social-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.likesCount}>{item.likes?.length || 0} likes</Text>
          <TouchableOpacity>
            <Text style={styles.viewComments}>View all comments</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Filters - like PWA MatchesComponent.js filterContainer
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Fixed Filters Row */}
      <View style={styles.fixedFilters}>
        {/* Location Filter */}
        <View style={styles.locationFilter}>
          <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.locationInput}
            placeholder="Search by Location"
            placeholderTextColor={COLORS.textLight}
            value={locationSearch}
            onChangeText={setLocationSearch}
          />
        </View>
        
        {/* Type Filters (1 on 1 / Team) */}
        <View style={styles.typeFilters}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilters.matchType === '1 on 1' && styles.activeFilter,
            ]}
            onPress={() => handleFilterChange('matchType', '1 on 1')}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilters.matchType === '1 on 1' && styles.activeFilterText,
            ]}>1 on 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilters.matchType === 'Team' && styles.activeFilter,
            ]}
            onPress={() => handleFilterChange('matchType', 'Team')}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilters.matchType === 'Team' && styles.activeFilterText,
            ]}>Team</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sport Type Filter - horizontal scroll like PWA */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportTypeScroll}
        contentContainerStyle={styles.sportTypeContainer}
      >
        {SPORT_TYPES.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.filterButton,
              activeFilters.sportType === sport && styles.activeFilter,
            ]}
            onPress={() => handleFilterChange('sportType', sport)}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilters.sportType === sport && styles.activeFilterText,
            ]}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Tabs - like PWA */}
      <View style={styles.statusTabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.statusTab,
              activeStatusTab === tab && styles.statusTabActive,
            ]}
            onPress={() => setActiveStatusTab(tab)}
          >
            <Text style={[
              styles.statusTabText,
              activeStatusTab === tab && styles.statusTabTextActive,
            ]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with My Matches toggle - like PWA */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.myMatchesToggle}>
          <Text style={styles.myMatchesLabel}>My Matches</Text>
          <TouchableOpacity
            style={[styles.toggleSwitch, showMyMatches && styles.toggleSwitchActive]}
            onPress={() => setShowMyMatches(!showMyMatches)}
          >
            <View style={[styles.toggleKnob, showMyMatches && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchCard}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderFilters}
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
              <Ionicons name="trophy-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No matches found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}

      {/* FAB for creating match */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateMatch')}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  myMatchesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myMatchesLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Filters - like PWA filterContainer
  filtersContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  fixedFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  typeFilters: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
  },
  activeFilter: {
    backgroundColor: COLORS.text,
  },
  filterButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  sportTypeScroll: {
    marginTop: SPACING.sm,
  },
  sportTypeContainer: {
    paddingRight: SPACING.md,
  },
  statusTabs: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  statusTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  statusTabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  statusTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statusTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  // Match Card - like PWA MatchCardPost
  matchCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  userInfo: {
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  postTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
  },
  postContent: {
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  matchCardInner: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  matchType: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  playerCard: {
    alignItems: 'center',
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xs,
  },
  playerName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  vsText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  matchMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sportName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  matchDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  postFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  likeSection: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  actionBtn: {
    marginRight: SPACING.lg,
  },
  likesCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewComments: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
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
  },
});

export default MatchesScreen;
