import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const STATUS_TABS = ['All Matches', 'Upcoming', 'Completed'];
const MATCH_TYPES = ['1 on 1', 'Team'];
const SPORTS = ['All', 'Football', 'Tennis', 'Cricket', 'Basketball', 'Soccer'];

const MatchesScreen = ({ navigation }) => {
  const { matches, fetchMatches, loading, joinMatch } = useMatch();
  const { user } = useAuth();
  const [activeStatusTab, setActiveStatusTab] = useState('All Matches');
  const [activeMatchType, setActiveMatchType] = useState('1 on 1');
  const [activeSport, setActiveSport] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [showMyMatches, setShowMyMatches] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const getFilteredMatches = () => {
    let filtered = matches || [];
    
    // Filter by My Matches
    if (showMyMatches && user) {
      filtered = filtered.filter(m => 
        m.creator?._id === user._id || 
        m.players?.some(p => p._id === user._id) ||
        m.teams?.some(t => t.players?.some(p => p._id === user._id))
      );
    }
    
    // Filter by status
    if (activeStatusTab === 'Upcoming') {
      filtered = filtered.filter(m => m.status === 'scheduled' || m.status === 'in-progress');
    } else if (activeStatusTab === 'Completed') {
      filtered = filtered.filter(m => m.status === 'completed');
    }
    
    // Filter by match type
    if (activeMatchType === '1 on 1') {
      filtered = filtered.filter(m => !m.isTeamMatch);
    } else {
      filtered = filtered.filter(m => m.isTeamMatch);
    }
    
    // Filter by sport
    if (activeSport !== 'All') {
      filtered = filtered.filter(m => m.sport?.name?.toLowerCase() === activeSport.toLowerCase());
    }
    
    // Filter by location
    if (searchLocation) {
      filtered = filtered.filter(m => 
        m.location?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleLikeMatch = (matchId) => {
    // TODO: Implement like functionality via API
    Alert.alert('Liked!', 'You liked this match');
  };

  const handleShareMatch = (match) => {
    Alert.alert('Share', `Share ${match.name} with your friends!`);
  };

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

  const renderMatchCard = ({ item }) => {
    const player1 = item.players?.[0] || item.creator;
    const player2 = item.players?.[1];
    const hasScores = item.scores && item.status === 'completed';
    
    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
      >
        {/* Creator info */}
        <View style={styles.creatorRow}>
          <Image
            source={{ uri: player1?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.creatorAvatar}
          />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{player1?.name || 'Player'}</Text>
            <Text style={styles.matchStatus}>
              {item.status === 'completed' ? 'Completed Match' : 
               item.status === 'in-progress' ? 'Live Match' : 'score-requested'}
            </Text>
          </View>
        </View>

        {/* Match description */}
        <Text style={styles.matchDescription}>
          {item.name || `${player1?.name || 'Player 1'} vs ${player2?.name || 'Player 2'} in an exciting ${item.sport?.name || 'Sport'} match!`}
        </Text>

        {/* Match type and location */}
        <View style={styles.matchMetaRow}>
          <Text style={styles.matchType}>{item.isTeamMatch ? 'Team' : '1 on 1'}</Text>
          <Text style={styles.matchLocation}>Location: {item.location || 'TBD'}</Text>
          {item.predictions && (
            <Text style={styles.predictLabel}>Predictions</Text>
          )}
        </View>

        {/* Players with scores */}
        <View style={styles.playersContainer}>
          {/* Player 1 */}
          <View style={styles.playerRow}>
            <Image
              source={{ uri: player1?.avatar || 'https://via.placeholder.com/32' }}
              style={styles.playerSmallAvatar}
            />
            <Text style={styles.playerName}>{player1?.name || 'Player 1'}</Text>
            {hasScores && (
              <View style={styles.scoresRow}>
                {(item.scores?.sets || [item.scores?.player1 || 0]).map((score, idx) => (
                  <View key={idx} style={styles.scoreBox}>
                    <Text style={styles.scoreText}>{score}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.predictions && (
              <View style={styles.predictionBar}>
                <View style={[styles.predictionFill, { width: `${item.predictions?.player1 || 50}%` }]} />
                <Text style={styles.predictionPercent}>{item.predictions?.player1 || 50}%</Text>
              </View>
            )}
          </View>

          {/* Player 2 */}
          <View style={styles.playerRow}>
            <Image
              source={{ uri: player2?.avatar || 'https://via.placeholder.com/32' }}
              style={styles.playerSmallAvatar}
            />
            <Text style={styles.playerName}>{player2?.name || 'Player 2'}</Text>
            {hasScores && (
              <View style={styles.scoresRow}>
                {(item.scores?.sets2 || [item.scores?.player2 || 0]).map((score, idx) => (
                  <View key={idx} style={styles.scoreBox}>
                    <Text style={styles.scoreText}>{score}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.predictions && (
              <View style={styles.predictionBar}>
                <View style={[styles.predictionFill, { width: `${item.predictions?.player2 || 50}%` }]} />
                <Text style={styles.predictionPercent}>{item.predictions?.player2 || 50}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Votes info */}
        {item.predictions && (
          <Text style={styles.votesText}>
            {item.predictions?.totalVotes || 0} votes | {item.status === 'completed' ? 'Expired' : 'Active'}
          </Text>
        )}

        {/* Sport and date */}
        <Text style={styles.sportDateText}>
          {item.sport?.name || 'Sport'},  {formatDate(item.date)}
        </Text>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.likesText}>{item.likes?.length || 0} likes</Text>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search by location */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Location"
            placeholderTextColor={COLORS.textLight}
            value={searchLocation}
            onChangeText={setSearchLocation}
          />
        </View>
        
        {/* Match type toggle */}
        <View style={styles.matchTypeToggle}>
          {MATCH_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.matchTypeBtn,
                activeMatchType === type && styles.matchTypeBtnActive,
              ]}
              onPress={() => setActiveMatchType(type)}
            >
              <Text
                style={[
                  styles.matchTypeText,
                  activeMatchType === type && styles.matchTypeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sports filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportsScroll}
        contentContainerStyle={styles.sportsContainer}
      >
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.sportChip,
              activeSport === sport && styles.sportChipActive,
            ]}
            onPress={() => setActiveSport(sport)}
          >
            <Text
              style={[
                styles.sportChipText,
                activeSport === sport && styles.sportChipTextActive,
              ]}
            >
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status tabs */}
      <View style={styles.statusTabsContainer}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.statusTab,
              activeStatusTab === tab && styles.statusTabActive,
            ]}
            onPress={() => setActiveStatusTab(tab)}
          >
            <Text
              style={[
                styles.statusTabText,
                activeStatusTab === tab && styles.statusTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerRight}>
          <Text style={styles.myMatchesLabel}>My Matches</Text>
          <TouchableOpacity
            style={[styles.toggleSwitch, showMyMatches && styles.toggleSwitchActive]}
            onPress={() => setShowMyMatches(!showMyMatches)}
          >
            <View style={[styles.toggleKnob, showMyMatches && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={getFilteredMatches()}
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
            <Text style={styles.emptySubtext}>Create a new match to get started</Text>
          </View>
        }
      />

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
  headerRight: {
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
    transform: [{ translateX: 20 }],
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
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
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  matchTypeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  matchTypeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  matchTypeBtnActive: {
    backgroundColor: COLORS.text,
  },
  matchTypeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  matchTypeTextActive: {
    color: COLORS.white,
  },
  sportsScroll: {
    marginBottom: SPACING.md,
  },
  sportsContainer: {
    paddingRight: SPACING.md,
  },
  sportChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sportChipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  sportChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  sportChipTextActive: {
    color: COLORS.white,
  },
  statusTabsContainer: {
    flexDirection: 'row',
  },
  statusTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  statusTabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  statusTabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statusTabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 100,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  creatorInfo: {
    marginLeft: SPACING.md,
  },
  creatorName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchStatus: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
  },
  matchDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  matchType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  matchLocation: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  predictLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  playersContainer: {
    marginBottom: SPACING.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  playerSmallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  playerName: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  scoresRow: {
    flexDirection: 'row',
  },
  scoreBox: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  scoreText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  predictionBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginLeft: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  predictionPercent: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  votesText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  sportDateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionBtn: {
    marginRight: SPACING.lg,
  },
  likesText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
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
