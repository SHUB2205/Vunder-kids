import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const TABS = ['Upcoming', 'Live', 'Completed'];

const MatchesScreen = ({ navigation }) => {
  const { matches, fetchMatches, loading } = useMatch();
  const [activeTab, setActiveTab] = useState('Upcoming');
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
    switch (activeTab) {
      case 'Upcoming':
        return matches.filter(m => m.status === 'scheduled' || m.status === 'in-progress');
      case 'Live':
        return matches.filter(m => m.status === 'in-progress');
      case 'Completed':
        return matches.filter(m => m.status === 'completed');
      default:
        return matches;
    }
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

  const renderMatchCard = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('MatchDetail', { match: item })}
    >
      <View style={styles.matchHeader}>
        <View style={styles.sportBadge}>
          <Ionicons name="trophy" size={14} color={COLORS.primary} />
          <Text style={styles.sportName}>{item.sport?.name || 'Sport'}</Text>
        </View>
        {item.status === 'in-progress' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <Text style={styles.matchName}>{item.name}</Text>

      <View style={styles.teamsContainer}>
        {item.isTeamMatch ? (
          <>
            <View style={styles.teamInfo}>
              <View style={styles.teamAvatar}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.teamName} numberOfLines={1}>
                {item.teams?.[0]?.team?.name || 'Team 1'}
              </Text>
              {item.scores && (
                <Text style={styles.score}>{item.scores.team1 || 0}</Text>
              )}
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.teamInfo}>
              <View style={styles.teamAvatar}>
                <Ionicons name="people" size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.teamName} numberOfLines={1}>
                {item.teams?.[1]?.team?.name || 'Team 2'}
              </Text>
              {item.scores && (
                <Text style={styles.score}>{item.scores.team2 || 0}</Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.playersRow}>
            {item.players?.slice(0, 4).map((player, index) => (
              <Image
                key={player._id || index}
                source={{ uri: player.avatar }}
                style={[styles.playerAvatar, { marginLeft: index > 0 ? -10 : 0 }]}
              />
            ))}
            {item.players?.length > 4 && (
              <View style={[styles.playerAvatar, styles.morePlayersAvatar]}>
                <Text style={styles.morePlayersText}>+{item.players.length - 4}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.matchFooter}>
        <View style={styles.matchInfo}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.matchInfoText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.matchInfo}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.matchInfoText}>{item.location}</Text>
        </View>
      </View>

      {item.status === 'scheduled' && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => navigation.navigate('MatchDetail', { match: item })}
        >
          <Text style={styles.joinButtonText}>View Details</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Facilities')}
          >
            <Ionicons name="business-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateMatch')}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
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
      </View>

      <FlatList
        data={getFilteredMatches()}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item._id}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  sportName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
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
  matchName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  teamInfo: {
    flex: 1,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  teamName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  score: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  vs: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.surface,
  },
  morePlayersAvatar: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  morePlayersText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchInfoText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
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
