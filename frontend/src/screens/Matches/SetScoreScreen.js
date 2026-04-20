import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

// Sport-specific scoring configurations
const SPORT_CONFIGS = {
  Tennis: { type: 'sets', maxSets: 5, setLabels: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'], unit: 'Sets' },
  Badminton: { type: 'sets', maxSets: 3, setLabels: ['Game 1', 'Game 2', 'Game 3'], unit: 'Games' },
  'Table Tennis': { type: 'sets', maxSets: 5, setLabels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5'], unit: 'Games' },
  Pickleball: { type: 'sets', maxSets: 3, setLabels: ['Game 1', 'Game 2', 'Game 3'], unit: 'Games' },
  Squash: { type: 'sets', maxSets: 5, setLabels: ['G1', 'G2', 'G3', 'G4', 'G5'], unit: 'Games' },
  Padel: { type: 'sets', maxSets: 3, setLabels: ['Set 1', 'Set 2', 'Set 3'], unit: 'Sets' },
  Volleyball: { type: 'sets', maxSets: 5, setLabels: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'], unit: 'Sets' },
  Basketball: { type: 'periods', periods: ['Q1', 'Q2', 'Q3', 'Q4'], unit: 'Total' },
  Football: { type: 'simple', label: 'Goals' },
  Rugby: { type: 'periods', periods: ['H1', 'H2'], unit: 'Total' },
  'American Football': { type: 'periods', periods: ['Q1', 'Q2', 'Q3', 'Q4'], unit: 'Total' },
  Cricket: { type: 'cricket' },
  Hockey: { type: 'periods', periods: ['P1', 'P2', 'P3'], unit: 'Total' },
  Baseball: { type: 'periods', periods: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], unit: 'Runs' },
  Golf: { type: 'simple', label: 'Strokes' },
  default: { type: 'simple', label: 'Score' },
};

// Common aliases (lowercase) -> canonical key
const SPORT_ALIASES = {
  soccer: 'Football',
  'futbol': 'Football',
  'ping pong': 'Table Tennis',
  'pingpong': 'Table Tennis',
  'table-tennis': 'Table Tennis',
  'american-football': 'American Football',
  'nfl': 'American Football',
  'ice hockey': 'Hockey',
  'field hockey': 'Hockey',
};

const resolveSportConfig = (rawName) => {
  const name = String(rawName || '').trim();
  if (!name) return { key: 'default', config: SPORT_CONFIGS.default };
  const lower = name.toLowerCase();
  // 1. Alias match
  if (SPORT_ALIASES[lower]) {
    const aliasKey = SPORT_ALIASES[lower];
    return { key: aliasKey, config: SPORT_CONFIGS[aliasKey] };
  }
  // 2. Case-insensitive exact match
  const exactKey = Object.keys(SPORT_CONFIGS).find((k) => k.toLowerCase() === lower);
  if (exactKey) return { key: exactKey, config: SPORT_CONFIGS[exactKey] };
  // 3. Loose contains match (e.g. "Men's Tennis" -> Tennis)
  const looseKey = Object.keys(SPORT_CONFIGS).find(
    (k) => k !== 'default' && (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower))
  );
  if (looseKey) return { key: looseKey, config: SPORT_CONFIGS[looseKey] };
  return { key: 'default', config: SPORT_CONFIGS.default };
};

const SetScoreScreen = ({ navigation, route }) => {
  const { match } = route.params;
  const { updateScore } = useMatch();
  
  // Extract sport name from various possible locations in match object
  const getSportName = () => {
    if (match?.sport?.name) return match.sport.name;
    if (match?.sportName) return match.sportName;
    if (typeof match?.sport === 'string') return match.sport;
    return 'default';
  };
  
  const sportName = getSportName();
  const { key: resolvedSportKey, config } = resolveSportConfig(sportName);
  
  const player1 = match?.creator || match?.players?.[0] || { name: 'Player 1' };
  const player2 = match?.opponent || match?.players?.[1] || { name: 'Player 2' };
  
  const team1Name = match?.isTeamMatch 
    ? (match?.teams?.[0]?.team?.name || match?.teams?.[0]?.name || 'Team 1')
    : (player1?.userName || player1?.name || 'Player 1');
  const team2Name = match?.isTeamMatch 
    ? (match?.teams?.[1]?.team?.name || match?.teams?.[1]?.name || 'Team 2')
    : (player2?.userName || player2?.name || match?.opponentName || 'Player 2');

  // Initialize scores based on sport type
  const initializeScores = () => {
    if (config.type === 'sets') {
      return {
        setDetails: Array(config.maxSets).fill(null).map(() => ({ p1: 0, p2: 0 })),
        sets: { player1: 0, player2: 0 },
      };
    }
    if (config.type === 'quarters' || config.type === 'periods') {
      return {
        periodDetails: config.periods.map(() => ({ t1: 0, t2: 0 })),
        total: { player1: 0, player2: 0 },
      };
    }
    if (config.type === 'cricket') {
      return {
        runs: { player1: 0, player2: 0 },
        wickets: { player1: 0, player2: 0 },
        overs: { player1: '0.0', player2: '0.0' },
      };
    }
    return {
      team1: match.scores?.team1?.toString() || '0',
      team2: match.scores?.team2?.toString() || '0',
    };
  };

  const [scores, setScores] = useState(match.scores || initializeScores());
  const [loading, setLoading] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);

  // Calculate totals for sets-based sports
  const calculateSetTotals = () => {
    if (!scores.setDetails) return { p1: 0, p2: 0 };
    let p1Sets = 0, p2Sets = 0;
    scores.setDetails.forEach(set => {
      if (set.p1 > set.p2) p1Sets++;
      else if (set.p2 > set.p1) p2Sets++;
    });
    return { p1: p1Sets, p2: p2Sets };
  };

  // Calculate totals for period-based sports
  const calculatePeriodTotals = () => {
    if (!scores.periodDetails) return { t1: 0, t2: 0 };
    let t1Total = 0, t2Total = 0;
    scores.periodDetails.forEach(period => {
      t1Total += parseInt(period.t1) || 0;
      t2Total += parseInt(period.t2) || 0;
    });
    return { t1: t1Total, t2: t2Total };
  };

  const handleUpdateScore = async () => {
    setLoading(true);
    
    // Build score data based on sport type
    let scoreData = {};
    if (config.type === 'sets') {
      const totals = calculateSetTotals();
      scoreData = {
        ...scores,
        sets: { player1: totals.p1, player2: totals.p2 },
        team1: totals.p1,
        team2: totals.p2,
      };
    } else if (config.type === 'quarters' || config.type === 'periods') {
      const totals = calculatePeriodTotals();
      scoreData = {
        ...scores,
        total: { player1: totals.t1, player2: totals.t2 },
        team1: totals.t1,
        team2: totals.t2,
      };
    } else if (config.type === 'cricket') {
      scoreData = {
        ...scores,
        team1: parseInt(scores.runs?.player1) || 0,
        team2: parseInt(scores.runs?.player2) || 0,
      };
    } else {
      scoreData = {
        team1: parseInt(scores.team1) || 0,
        team2: parseInt(scores.team2) || 0,
      };
    }
    
    const result = await updateScore(match._id, scoreData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Score updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to update score');
    }
  };

  const incrementScore = (team) => {
    setScores((prev) => ({
      ...prev,
      [team]: (parseInt(prev[team]) + 1).toString(),
    }));
  };

  const decrementScore = (team) => {
    setScores((prev) => ({
      ...prev,
      [team]: Math.max(0, parseInt(prev[team]) - 1).toString(),
    }));
  };

  // Update set score
  const updateSetScore = (setIndex, player, value) => {
    setScores(prev => {
      const newSetDetails = [...(prev.setDetails || [])];
      if (!newSetDetails[setIndex]) newSetDetails[setIndex] = { p1: 0, p2: 0 };
      newSetDetails[setIndex][player] = Math.max(0, parseInt(value) || 0);
      return { ...prev, setDetails: newSetDetails };
    });
  };

  // Update period score
  const updatePeriodScore = (periodIndex, team, value) => {
    setScores(prev => {
      const newPeriodDetails = [...(prev.periodDetails || [])];
      if (!newPeriodDetails[periodIndex]) newPeriodDetails[periodIndex] = { t1: 0, t2: 0 };
      newPeriodDetails[periodIndex][team] = Math.max(0, parseInt(value) || 0);
      return { ...prev, periodDetails: newPeriodDetails };
    });
  };

  // Render sets-based scoring (Tennis, Badminton, etc.) - dynamic over config.maxSets
  const renderSetsScoring = () => {
    const numSets = config.maxSets || 3;
    const setIndices = Array.from({ length: numSets }, (_, i) => i);
    const unitLabel = config.unit || 'Sets';

    const renderPlayerSets = (playerKey, name, avatar, placeholderColor, total) => (
      <View style={styles.playerScoreRow}>
        <View style={styles.playerInfoColumn}>
          {!match?.isTeamMatch && avatar ? (
            <Image source={{ uri: avatar }} style={styles.miniAvatar} />
          ) : (
            <View style={[styles.miniAvatarPlaceholder, placeholderColor && { backgroundColor: placeholderColor + '20' }]}>
              <Ionicons name="person" size={14} color={placeholderColor || COLORS.primary} />
            </View>
          )}
          <Text style={styles.playerNameText} numberOfLines={1}>{name}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.setsScrollContent} style={styles.setsScrollFlex}>
          {setIndices.map((setIdx) => (
            <View key={setIdx} style={styles.setInputColumn}>
              <TouchableOpacity
                style={styles.miniScoreBtn}
                onPress={() => updateSetScore(setIdx, playerKey, (scores.setDetails?.[setIdx]?.[playerKey] || 0) + 1)}
                onLongPress={() => updateSetScore(setIdx, playerKey, Math.max(0, (scores.setDetails?.[setIdx]?.[playerKey] || 0) - 1))}
              >
                <Text style={styles.miniScoreText}>{scores.setDetails?.[setIdx]?.[playerKey] || 0}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.totalScoreColumn}>
          <Text style={styles.totalScoreText}>{total}</Text>
        </View>
      </View>
    );

    const totals = calculateSetTotals();

    return (
      <View style={styles.setsContainer}>
        <View style={styles.setsHeader}>
          <View style={styles.playerHeaderColumn}>
            <Text style={styles.playerHeaderText}>Player</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.setsScrollContent} style={styles.setsScrollFlex}>
            {setIndices.map((idx) => (
              <View key={idx} style={styles.setHeaderColumn}>
                <Text style={styles.setHeaderText}>
                  {config.setLabels?.[idx]?.replace('Set ', 'S').replace('Game ', 'G') || `#${idx + 1}`}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.totalHeaderColumn}>
            <Text style={styles.totalHeaderText}>{unitLabel}</Text>
          </View>
        </View>

        {renderPlayerSets('p1', team1Name, player1?.avatar, COLORS.primary, totals.p1)}
        {renderPlayerSets('p2', team2Name, player2?.avatar, COLORS.secondary, totals.p2)}

        <Text style={styles.tapHint}>Tap to increment • Long press to decrease{numSets > 3 ? ' • swipe to see more sets' : ''}</Text>
      </View>
    );
  };

  // Render quarters/periods scoring (Basketball, Hockey, Baseball innings, Rugby halves)
  const renderQuartersScoring = () => {
    const periods = config.periods || [];
    const unitLabel = config.unit || 'Total';
    const totals = calculatePeriodTotals();

    const renderTeamPeriods = (teamKey, name, total) => (
      <View style={styles.teamScoreRow}>
        <View style={styles.teamInfoColumn}>
          <Text style={styles.teamNameSmall} numberOfLines={1}>{name}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodsScrollContent} style={styles.periodsScrollFlex}>
          {periods.map((_, idx) => (
            <View key={idx} style={styles.quarterInputColumn}>
              <TextInput
                style={styles.quarterInput}
                value={String(scores.periodDetails?.[idx]?.[teamKey] || 0)}
                onChangeText={(val) => updatePeriodScore(idx, teamKey, val)}
                keyboardType="number-pad"
                textAlign="center"
                selectTextOnFocus
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.totalScoreColumn}>
          <Text style={styles.totalScoreLarge}>{total}</Text>
        </View>
      </View>
    );

    return (
      <View style={styles.quartersContainer}>
        <View style={styles.quartersHeader}>
          <View style={styles.teamHeaderColumn}>
            <Text style={styles.teamHeaderText}>Team</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodsScrollContent} style={styles.periodsScrollFlex}>
            {periods.map((period, idx) => (
              <View key={idx} style={styles.quarterHeaderColumn}>
                <Text style={styles.quarterHeaderText}>{period}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.totalHeaderColumn}>
            <Text style={styles.totalHeaderText}>{unitLabel}</Text>
          </View>
        </View>

        {renderTeamPeriods('t1', team1Name, totals.t1)}
        {renderTeamPeriods('t2', team2Name, totals.t2)}
        {periods.length > 4 && (
          <Text style={styles.tapHint}>Swipe horizontally to see all periods</Text>
        )}
      </View>
    );
  };

  // Render cricket scoring
  const renderCricketScoring = () => (
    <View style={styles.cricketContainer}>
      {[{ name: team1Name, key: 'player1', avatar: player1?.avatar }, 
        { name: team2Name, key: 'player2', avatar: player2?.avatar }].map((team, idx) => (
        <View key={idx} style={styles.cricketTeamCard}>
          <Text style={styles.cricketTeamName}>{team.name}</Text>
          <View style={styles.cricketInputsRow}>
            <View style={styles.cricketInputGroup}>
              <Text style={styles.cricketInputLabel}>Runs</Text>
              <TextInput
                style={styles.cricketInput}
                value={String(scores.runs?.[team.key] || 0)}
                onChangeText={(val) => setScores(prev => ({
                  ...prev,
                  runs: { ...prev.runs, [team.key]: parseInt(val) || 0 }
                }))}
                keyboardType="number-pad"
                textAlign="center"
              />
            </View>
            <View style={styles.cricketInputGroup}>
              <Text style={styles.cricketInputLabel}>Wickets</Text>
              <TextInput
                style={styles.cricketInput}
                value={String(scores.wickets?.[team.key] || 0)}
                onChangeText={(val) => setScores(prev => ({
                  ...prev,
                  wickets: { ...prev.wickets, [team.key]: Math.min(10, parseInt(val) || 0) }
                }))}
                keyboardType="number-pad"
                textAlign="center"
              />
            </View>
            <View style={styles.cricketInputGroup}>
              <Text style={styles.cricketInputLabel}>Overs</Text>
              <TextInput
                style={styles.cricketInput}
                value={scores.overs?.[team.key] || '0.0'}
                onChangeText={(val) => setScores(prev => ({
                  ...prev,
                  overs: { ...prev.overs, [team.key]: val }
                }))}
                keyboardType="decimal-pad"
                textAlign="center"
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  // Render simple scoring (Football, etc.)
  const renderSimpleScoring = () => (
    <View style={styles.simpleContainer}>
      <View style={styles.simpleTeamSection}>
        {!match?.isTeamMatch && player1?.avatar ? (
          <Image source={{ uri: player1.avatar }} style={styles.teamAvatar} />
        ) : (
          <View style={styles.teamAvatarIcon}>
            <Ionicons name="people" size={32} color={COLORS.primary} />
          </View>
        )}
        <Text style={styles.simpleTeamName} numberOfLines={1}>{team1Name}</Text>
        <View style={styles.scoreControls}>
          <TouchableOpacity style={styles.scoreButton} onPress={() => decrementScore('team1')}>
            <Ionicons name="remove" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.scoreInput}
            value={scores.team1}
            onChangeText={(text) => setScores(prev => ({ ...prev, team1: text.replace(/[^0-9]/g, '') }))}
            keyboardType="number-pad"
            textAlign="center"
          />
          <TouchableOpacity style={styles.scoreButton} onPress={() => incrementScore('team1')}>
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      <View style={styles.simpleTeamSection}>
        {!match?.isTeamMatch && player2?.avatar ? (
          <Image source={{ uri: player2.avatar }} style={styles.teamAvatar} />
        ) : (
          <View style={[styles.teamAvatarIcon, { backgroundColor: COLORS.secondary + '20' }]}>
            <Ionicons name="people" size={32} color={COLORS.secondary} />
          </View>
        )}
        <Text style={styles.simpleTeamName} numberOfLines={1}>{team2Name}</Text>
        <View style={styles.scoreControls}>
          <TouchableOpacity style={styles.scoreButton} onPress={() => decrementScore('team2')}>
            <Ionicons name="remove" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.scoreInput}
            value={scores.team2}
            onChangeText={(text) => setScores(prev => ({ ...prev, team2: text.replace(/[^0-9]/g, '') }))}
            keyboardType="number-pad"
            textAlign="center"
          />
          <TouchableOpacity style={styles.scoreButton} onPress={() => incrementScore('team2')}>
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Choose renderer based on sport type
  const renderScoringUI = () => {
    switch (config.type) {
      case 'sets':
        return renderSetsScoring();
      case 'quarters':
      case 'periods':
      case 'innings':
        return renderQuartersScoring();
      case 'cricket':
        return renderCricketScoring();
      default:
        return renderSimpleScoring();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Score</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.matchHeader}>
            <Text style={styles.sportEmoji}>{getSportEmoji(sportName)}</Text>
            <Text style={styles.matchName}>{match.name}</Text>
            <Text style={styles.sportLabel}>{resolvedSportKey !== 'default' ? resolvedSportKey : sportName}</Text>
          </View>

          {renderScoringUI()}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              Once you submit the score, other admins will need to confirm it before it becomes final.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdateScore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.updateButtonText}>Update Score</Text>
          )}
        </TouchableOpacity>
      </View>
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
  matchName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  teamScoreSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamAvatarSecondary: {
    backgroundColor: COLORS.secondary + '20',
  },
  teamName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInput: {
    width: 60,
    height: 60,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.sm,
  },
  vsContainer: {
    paddingHorizontal: SPACING.md,
  },
  vsText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.info + '15',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  
  // Match header styles
  matchHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sportEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  sportLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  // Sets scoring styles
  setsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playerHeaderColumn: {
    flex: 2,
  },
  playerHeaderText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  setHeaderColumn: {
    width: 44,
    alignItems: 'center',
  },
  setHeaderText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalHeaderColumn: {
    width: 44,
    alignItems: 'center',
  },
  totalHeaderText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  playerScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  playerInfoColumn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  miniAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  playerNameText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    flex: 1,
  },
  setInputColumn: {
    width: 44,
    alignItems: 'center',
  },
  setsScrollContent: {
    alignItems: 'center',
  },
  setsScrollFlex: {
    flex: 1,
  },
  periodsScrollContent: {
    alignItems: 'center',
  },
  periodsScrollFlex: {
    flex: 1,
  },
  miniScoreBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniScoreText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalScoreColumn: {
    width: 44,
    alignItems: 'center',
  },
  totalScoreText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tapHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  
  // Quarters scoring styles
  quartersContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quartersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamHeaderColumn: {
    flex: 2,
  },
  teamHeaderText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  quarterHeaderColumn: {
    width: 36,
    alignItems: 'center',
  },
  quarterHeaderText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  teamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  teamInfoColumn: {
    flex: 2,
  },
  teamNameSmall: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  quarterInputColumn: {
    width: 36,
    alignItems: 'center',
  },
  quarterInput: {
    width: 32,
    height: 32,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalScoreLarge: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  
  // Cricket scoring styles
  cricketContainer: {
    marginBottom: SPACING.lg,
  },
  cricketTeamCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cricketTeamName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  cricketInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cricketInputGroup: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cricketInputLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  cricketInput: {
    width: '100%',
    height: 44,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Simple scoring styles
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  simpleTeamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamAvatarIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  simpleTeamName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    maxWidth: 100,
  },
});

export default SetScoreScreen;
