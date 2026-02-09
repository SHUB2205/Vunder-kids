import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useMatch } from '../../context/MatchContext';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const SPORTS_TABS = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'football', label: 'Football', icon: 'football' },
  { id: 'tennis', label: 'Tennis', icon: 'tennisball' },
  { id: 'cricket', label: 'Cricket', icon: 'baseball' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball' },
  { id: 'soccer', label: 'Soccer', icon: 'football-outline' },
];

const DATE_TABS = ['Yesterday', 'Today', 'Tomorrow'];

const SearchScreen = ({ navigation, route }) => {
  const { matches, fetchMatches, loading: matchLoading } = useMatch();
  const [activeSport, setActiveSport] = useState('all');
  const [activeDate, setActiveDate] = useState('Today');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [liveScores, setLiveScores] = useState([]);

  useEffect(() => {
    fetchLiveScores();
    fetchMatches();
  }, []);

  useEffect(() => {
    // Convert Fisiko matches to score format
    if (matches && matches.length > 0) {
      const fisikoScores = matches
        .filter(m => m.status === 'in-progress' || m.status === 'completed')
        .map(m => ({
          id: m._id,
          sport: m.sport?.name?.toLowerCase() || 'other',
          league: 'Fisiko Match',
          team1: {
            name: m.isTeamMatch ? m.teams?.[0]?.name : (m.players?.[0]?.name || m.creator?.name || 'Player 1'),
            logo: m.isTeamMatch ? 'https://via.placeholder.com/40' : (m.players?.[0]?.avatar || m.creator?.avatar || 'https://via.placeholder.com/40'),
            score: m.scores?.team1 || 0,
          },
          team2: {
            name: m.isTeamMatch ? m.teams?.[1]?.name : (m.players?.[1]?.name || 'Player 2'),
            logo: m.isTeamMatch ? 'https://via.placeholder.com/40' : (m.players?.[1]?.avatar || 'https://via.placeholder.com/40'),
            score: m.scores?.team2 || 0,
          },
          status: m.status === 'in-progress' ? 'live' : 'completed',
          time: m.status === 'in-progress' ? 'Live' : 'Final',
          isFisiko: true,
          matchData: m,
        }));
      
      setLiveScores(prev => {
        const externalScores = prev.filter(s => !s.isFisiko);
        return [...fisikoScores, ...externalScores];
      });
    }
  }, [matches]);

  const fetchLiveScores = async () => {
    setLoading(true);
    // Mock external live scores data - in production, this would call a sports API
    setTimeout(() => {
      const externalScores = [
        {
          id: 'ext-1',
          sport: 'football',
          league: 'Premier League',
          team1: { name: 'Manchester United', logo: 'https://via.placeholder.com/40', score: 2 },
          team2: { name: 'Liverpool', logo: 'https://via.placeholder.com/40', score: 1 },
          status: 'live',
          time: "65'",
          isFisiko: false,
        },
        {
          id: 'ext-2',
          sport: 'tennis',
          league: 'Wimbledon',
          team1: { name: 'Djokovic', logo: 'https://via.placeholder.com/40', score: '6-4, 3-2' },
          team2: { name: 'Nadal', logo: 'https://via.placeholder.com/40', score: '4-6, 2-3' },
          status: 'live',
          time: 'Set 2',
          isFisiko: false,
        },
        {
          id: 'ext-3',
          sport: 'cricket',
          league: 'IPL',
          team1: { name: 'Mumbai Indians', logo: 'https://via.placeholder.com/40', score: '185/4' },
          team2: { name: 'Chennai Super Kings', logo: 'https://via.placeholder.com/40', score: '142/6' },
          status: 'live',
          time: '18.2 overs',
          isFisiko: false,
        },
        {
          id: 'ext-4',
          sport: 'basketball',
          league: 'NBA',
          team1: { name: 'Lakers', logo: 'https://via.placeholder.com/40', score: 98 },
          team2: { name: 'Warriors', logo: 'https://via.placeholder.com/40', score: 102 },
          status: 'completed',
          time: 'Final',
          isFisiko: false,
        },
      ];
      
      setLiveScores(prev => {
        const fisikoScores = prev.filter(s => s.isFisiko);
        return [...fisikoScores, ...externalScores];
      });
      setLoading(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLiveScores(), fetchMatches()]);
    setRefreshing(false);
  };

  const handleScorePress = (item) => {
    if (item.isFisiko && item.matchData) {
      navigation.navigate('MatchDetail', { match: item.matchData });
    }
  };

  const getFilteredScores = () => {
    if (activeSport === 'all') return liveScores;
    return liveScores.filter(score => score.sport === activeSport);
  };

  const renderScoreCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.scoreCard}
      onPress={() => handleScorePress(item)}
      activeOpacity={item.isFisiko ? 0.7 : 1}
    >
      <View style={styles.scoreCardHeader}>
        <View style={styles.leagueRow}>
          <Text style={styles.leagueName}>{item.league}</Text>
          {item.isFisiko && (
            <View style={styles.fisikoBadge}>
              <Text style={styles.fisikoBadgeText}>Fisiko</Text>
            </View>
          )}
        </View>
        {item.status === 'live' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {item.status === 'completed' && (
          <Text style={styles.completedText}>Completed</Text>
        )}
      </View>
      
      <View style={styles.teamsRow}>
        {/* Team 1 */}
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.team1.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName} numberOfLines={1}>{item.team1.name}</Text>
        </View>
        
        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.team1.score}</Text>
          <Text style={styles.scoreDivider}>-</Text>
          <Text style={styles.scoreText}>{item.team2.score}</Text>
        </View>
        
        {/* Team 2 */}
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.team2.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName} numberOfLines={1}>{item.team2.name}</Text>
        </View>
      </View>
      
      <View style={styles.scoreCardFooter}>
        <Text style={styles.matchTime}>{item.time}</Text>
        {item.isFisiko && (
          <TouchableOpacity style={styles.detailsBtn} onPress={() => handleScorePress(item)}>
            <Text style={styles.detailsBtnText}>View Match</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scores</Text>
      </View>

      {/* Sports Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportsTabsContainer}
        contentContainerStyle={styles.sportsTabsContent}
      >
        {SPORTS_TABS.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportTab,
              activeSport === sport.id && styles.sportTabActive,
            ]}
            onPress={() => setActiveSport(sport.id)}
          >
            <Ionicons
              name={sport.icon}
              size={18}
              color={activeSport === sport.id ? COLORS.white : COLORS.text}
            />
            <Text
              style={[
                styles.sportTabText,
                activeSport === sport.id && styles.sportTabTextActive,
              ]}
            >
              {sport.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date Tabs */}
      <View style={styles.dateTabsContainer}>
        {DATE_TABS.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateTab,
              activeDate === date && styles.dateTabActive,
            ]}
            onPress={() => setActiveDate(date)}
          >
            <Text
              style={[
                styles.dateTabText,
                activeDate === date && styles.dateTabTextActive,
              ]}
            >
              {date}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.calendarBtn}>
          <Ionicons name="calendar" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredScores()}
          renderItem={renderScoreCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scoresListContent}
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
              <Text style={styles.emptyText}>No scores available</Text>
              <Text style={styles.emptySubtext}>Check back later for live scores</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
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
  sportsTabsContainer: {
    backgroundColor: COLORS.white,
    maxHeight: 60,
  },
  sportsTabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  sportTabActive: {
    backgroundColor: COLORS.text,
  },
  sportTabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  sportTabTextActive: {
    color: COLORS.white,
  },
  dateTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
  },
  dateTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.text,
  },
  dateTabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  dateTabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  calendarBtn: {
    marginLeft: 'auto',
    padding: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoresListContent: {
    padding: SPACING.md,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fisikoBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  fisikoBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: SPACING.xs,
  },
  liveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.error,
  },
  completedText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  teamName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  scoreText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreDivider: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  scoreCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  matchTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsBtnText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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

export default SearchScreen;
