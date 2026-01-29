import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const MatchDetailScreen = ({ navigation, route }) => {
  const { match } = route.params;
  const { user } = useAuth();
  const { joinMatch } = useMatch();
  const [joining, setJoining] = useState(false);

  const isParticipant = match.players?.some(p => p._id === user?._id) ||
    match.teams?.some(t => t.team?.members?.includes(user?._id));

  const isAdmin = match.admins?.includes(user?._id) || match.creator === user?._id;

  const handleJoin = async () => {
    setJoining(true);
    const result = await joinMatch(match._id);
    setJoining(false);

    if (result.success) {
      Alert.alert('Success', 'You have joined the match!');
    } else {
      Alert.alert('Error', result.error || 'Failed to join match');
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Details</Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('SetScore', { match })}>
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.matchHeader}>
          <View style={styles.sportBadge}>
            <Ionicons name="trophy" size={16} color={COLORS.primary} />
            <Text style={styles.sportName}>{match.sport?.name || 'Sport'}</Text>
          </View>
          {match.status === 'in-progress' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <Text style={styles.matchName}>{match.name}</Text>

        {match.isTeamMatch && match.teams?.length >= 2 && (
          <View style={styles.scoreBoard}>
            <View style={styles.teamScore}>
              <View style={styles.teamAvatarLarge}>
                <Ionicons name="people" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.teamNameLarge}>{match.teams[0]?.team?.name}</Text>
              <Text style={styles.scoreLarge}>{match.scores?.team1 || 0}</Text>
            </View>
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.teamScore}>
              <View style={styles.teamAvatarLarge}>
                <Ionicons name="people" size={32} color={COLORS.secondary} />
              </View>
              <Text style={styles.teamNameLarge}>{match.teams[1]?.team?.name}</Text>
              <Text style={styles.scoreLarge}>{match.scores?.team2 || 0}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(match.date)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(match.date)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{match.location}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, styles.statusText]}>
                {match.status?.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Participants</Text>
        <View style={styles.participantsCard}>
          {match.players?.map((player) => (
            <TouchableOpacity
              key={player._id}
              style={styles.participantItem}
              onPress={() => navigation.navigate('UserProfile', { userId: player._id })}
            >
              <Image source={{ uri: player.avatar }} style={styles.participantAvatar} />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {player.userName || player.name}
                </Text>
                {match.admins?.includes(player._id) && (
                  <Text style={styles.adminBadge}>Admin</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {(!match.players || match.players.length === 0) && (
            <Text style={styles.noParticipants}>No participants yet</Text>
          )}
        </View>

        {match.predictions && (
          <>
            <Text style={styles.sectionTitle}>Predictions</Text>
            <View style={styles.predictionsCard}>
              <View style={styles.predictionOption}>
                <Text style={styles.predictionLabel}>
                  {match.teams?.[0]?.team?.name || 'Team 1'}
                </Text>
                <View style={styles.predictionBar}>
                  <View
                    style={[
                      styles.predictionFill,
                      {
                        width: `${
                          (match.predictions.option1?.length /
                            (match.predictions.option1?.length +
                              match.predictions.option2?.length || 1)) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.predictionCount}>
                  {match.predictions.option1?.length || 0} votes
                </Text>
              </View>
              <View style={styles.predictionOption}>
                <Text style={styles.predictionLabel}>
                  {match.teams?.[1]?.team?.name || 'Team 2'}
                </Text>
                <View style={styles.predictionBar}>
                  <View
                    style={[
                      styles.predictionFill,
                      styles.predictionFillSecondary,
                      {
                        width: `${
                          (match.predictions.option2?.length /
                            (match.predictions.option1?.length +
                              match.predictions.option2?.length || 1)) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.predictionCount}>
                  {match.predictions.option2?.length || 0} votes
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {!isParticipant && match.status === 'scheduled' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.joinButton, joining && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={joining}
          >
            <Text style={styles.joinButtonText}>
              {joining ? 'Joining...' : 'Join Match'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isAdmin && match.status !== 'completed' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.setScoreButton}
            onPress={() => navigation.navigate('SetScore', { match })}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
            <Text style={styles.setScoreButtonText}>Set Score</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  sportName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: SPACING.md,
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
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamNameLarge: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  scoreLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  vsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  vsText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoContent: {
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 2,
  },
  statusText: {
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  participantsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  participantInfo: {
    marginLeft: SPACING.md,
  },
  participantName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  adminBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  noParticipants: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  predictionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  predictionOption: {
    marginBottom: SPACING.md,
  },
  predictionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  predictionBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  predictionFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  predictionFillSecondary: {
    backgroundColor: COLORS.secondary,
  },
  predictionCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  setScoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  setScoreButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
});

export default MatchDetailScreen;
