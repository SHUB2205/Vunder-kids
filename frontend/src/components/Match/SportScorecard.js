import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

// Sport-specific scorecard configurations
const SPORT_CONFIGS = {
  Tennis: {
    type: 'sets',
    periods: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
    maxSets: 5,
    tiebreak: true,
  },
  Badminton: {
    type: 'sets',
    periods: ['Game 1', 'Game 2', 'Game 3'],
    maxSets: 3,
  },
  'Table Tennis': {
    type: 'sets',
    periods: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5'],
    maxSets: 5,
  },
  Pickleball: {
    type: 'sets',
    periods: ['Game 1', 'Game 2', 'Game 3'],
    maxSets: 3,
  },
  Padel: {
    type: 'sets',
    periods: ['Set 1', 'Set 2', 'Set 3'],
    maxSets: 3,
  },
  Basketball: {
    type: 'quarters',
    periods: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'],
    hasOvertime: true,
  },
  Football: {
    type: 'halves',
    periods: ['1st Half', '2nd Half', 'ET', 'PEN'],
    hasExtraTime: true,
  },
  Cricket: {
    type: 'innings',
    periods: ['1st Innings', '2nd Innings'],
    showOvers: true,
    showWickets: true,
  },
  Volleyball: {
    type: 'sets',
    periods: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
    maxSets: 5,
  },
  Baseball: {
    type: 'innings',
    periods: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    maxInnings: 9,
  },
  Hockey: {
    type: 'periods',
    periods: ['P1', 'P2', 'P3', 'OT'],
    hasOvertime: true,
  },
  Golf: {
    type: 'holes',
    showStrokes: true,
    showHolesPlayed: true,
  },
  Boxing: {
    type: 'rounds',
    maxRounds: 12,
    showKO: true,
  },
  default: {
    type: 'simple',
    periods: ['Final'],
  },
};

const SportScorecard = ({ 
  match, 
  scores = {}, 
  sport = 'default',
  isLive = false,
  showWinner = true,
  compact = false,
}) => {
  const sportName = typeof sport === 'object' ? sport.name : sport;
  const config = SPORT_CONFIGS[sportName] || SPORT_CONFIGS.default;
  
  const player1 = match?.creator || match?.players?.[0] || { name: 'Player 1' };
  const player2 = match?.opponent || match?.players?.[1] || { name: 'Player 2' };
  
  const team1Name = match?.isTeamMatch 
    ? (match?.teams?.[0]?.team?.name || match?.teams?.[0]?.name || 'Team 1')
    : (player1?.userName || player1?.name || 'Player 1');
  const team2Name = match?.isTeamMatch 
    ? (match?.teams?.[1]?.team?.name || match?.teams?.[1]?.name || 'Team 2')
    : (player2?.userName || player2?.name || match?.opponentName || 'Player 2');

  // Calculate total scores and determine winner
  const getScoreSummary = () => {
    if (config.type === 'sets') {
      const sets1 = scores?.sets?.player1 || 0;
      const sets2 = scores?.sets?.player2 || 0;
      return { score1: sets1, score2: sets2, label: 'Sets' };
    }
    if (config.type === 'quarters' || config.type === 'halves' || config.type === 'periods') {
      const total1 = scores?.total?.player1 || scores?.team1 || 0;
      const total2 = scores?.total?.player2 || scores?.team2 || 0;
      return { score1: total1, score2: total2, label: 'Points' };
    }
    if (config.type === 'innings' && sportName === 'Cricket') {
      const runs1 = scores?.runs?.player1 || 0;
      const runs2 = scores?.runs?.player2 || 0;
      const wickets1 = scores?.wickets?.player1 || 0;
      const wickets2 = scores?.wickets?.player2 || 0;
      return { 
        score1: `${runs1}/${wickets1}`, 
        score2: `${runs2}/${wickets2}`, 
        label: 'Runs/Wickets' 
      };
    }
    return { 
      score1: scores?.team1 || scores?.player1 || 0, 
      score2: scores?.team2 || scores?.player2 || 0, 
      label: 'Score' 
    };
  };

  const summary = getScoreSummary();
  const winner = summary.score1 > summary.score2 ? 1 : summary.score1 < summary.score2 ? 2 : 0;

  // Render sets/games for tennis-like sports
  const renderSetsScorecard = () => {
    const setScores = scores?.setDetails || [];
    return (
      <View style={styles.setsContainer}>
        <View style={styles.setsHeader}>
          <View style={styles.playerColumn}>
            <Text style={styles.playerLabel}></Text>
          </View>
          {config.periods.slice(0, setScores.length || 3).map((period, idx) => (
            <View key={idx} style={styles.setPeriodColumn}>
              <Text style={styles.setPeriodLabel}>{period.replace('Set ', 'S').replace('Game ', 'G')}</Text>
            </View>
          ))}
          <View style={styles.totalColumn}>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        </View>
        
        {/* Player 1 Row */}
        <View style={[styles.playerRow, winner === 1 && styles.winnerRow]}>
          <View style={styles.playerColumn}>
            <Text style={[styles.playerName, winner === 1 && styles.winnerText]} numberOfLines={1}>
              {team1Name}
            </Text>
            {winner === 1 && showWinner && <Ionicons name="trophy" size={14} color={COLORS.primary} />}
          </View>
          {(setScores.length > 0 ? setScores : [{p1: 0, p2: 0}, {p1: 0, p2: 0}, {p1: 0, p2: 0}]).map((set, idx) => (
            <View key={idx} style={styles.setScoreColumn}>
              <Text style={[styles.setScore, set.p1 > set.p2 && styles.winningSetScore]}>
                {set.p1 || 0}
              </Text>
            </View>
          ))}
          <View style={styles.totalColumn}>
            <Text style={[styles.totalScore, winner === 1 && styles.winnerScore]}>
              {summary.score1}
            </Text>
          </View>
        </View>
        
        {/* Player 2 Row */}
        <View style={[styles.playerRow, winner === 2 && styles.winnerRow]}>
          <View style={styles.playerColumn}>
            <Text style={[styles.playerName, winner === 2 && styles.winnerText]} numberOfLines={1}>
              {team2Name}
            </Text>
            {winner === 2 && showWinner && <Ionicons name="trophy" size={14} color={COLORS.primary} />}
          </View>
          {(setScores.length > 0 ? setScores : [{p1: 0, p2: 0}, {p1: 0, p2: 0}, {p1: 0, p2: 0}]).map((set, idx) => (
            <View key={idx} style={styles.setScoreColumn}>
              <Text style={[styles.setScore, set.p2 > set.p1 && styles.winningSetScore]}>
                {set.p2 || 0}
              </Text>
            </View>
          ))}
          <View style={styles.totalColumn}>
            <Text style={[styles.totalScore, winner === 2 && styles.winnerScore]}>
              {summary.score2}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render quarters/periods for basketball-like sports
  const renderQuartersScorecard = () => {
    const periodScores = scores?.periodDetails || [];
    return (
      <View style={styles.quartersContainer}>
        <View style={styles.quartersHeader}>
          <View style={styles.teamColumnWide}></View>
          {config.periods.slice(0, Math.max(periodScores.length, 4)).map((period, idx) => (
            <View key={idx} style={styles.quarterColumn}>
              <Text style={styles.quarterLabel}>{period}</Text>
            </View>
          ))}
          <View style={styles.totalColumnWide}>
            <Text style={styles.totalLabel}>T</Text>
          </View>
        </View>
        
        {/* Team 1 */}
        <View style={[styles.teamRow, winner === 1 && styles.winnerRow]}>
          <View style={styles.teamColumnWide}>
            <Text style={[styles.teamNameText, winner === 1 && styles.winnerText]} numberOfLines={1}>
              {team1Name}
            </Text>
          </View>
          {(periodScores.length > 0 ? periodScores : [{t1: 0, t2: 0}, {t1: 0, t2: 0}, {t1: 0, t2: 0}, {t1: 0, t2: 0}]).map((period, idx) => (
            <View key={idx} style={styles.quarterColumn}>
              <Text style={styles.quarterScore}>{period.t1 || 0}</Text>
            </View>
          ))}
          <View style={styles.totalColumnWide}>
            <Text style={[styles.totalScoreLarge, winner === 1 && styles.winnerScore]}>
              {summary.score1}
            </Text>
          </View>
        </View>
        
        {/* Team 2 */}
        <View style={[styles.teamRow, winner === 2 && styles.winnerRow]}>
          <View style={styles.teamColumnWide}>
            <Text style={[styles.teamNameText, winner === 2 && styles.winnerText]} numberOfLines={1}>
              {team2Name}
            </Text>
          </View>
          {(periodScores.length > 0 ? periodScores : [{t1: 0, t2: 0}, {t1: 0, t2: 0}, {t1: 0, t2: 0}, {t1: 0, t2: 0}]).map((period, idx) => (
            <View key={idx} style={styles.quarterColumn}>
              <Text style={styles.quarterScore}>{period.t2 || 0}</Text>
            </View>
          ))}
          <View style={styles.totalColumnWide}>
            <Text style={[styles.totalScoreLarge, winner === 2 && styles.winnerScore]}>
              {summary.score2}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render simple score for basic sports
  const renderSimpleScorecard = () => (
    <View style={styles.simpleContainer}>
      <View style={[styles.simpleTeam, winner === 1 && styles.winnerTeam]}>
        {match?.isTeamMatch ? (
          <View style={styles.teamIcon}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
          </View>
        ) : (
          <Image 
            source={{ uri: player1?.avatar || 'https://via.placeholder.com/50' }} 
            style={styles.playerAvatar}
          />
        )}
        <Text style={[styles.simpleTeamName, winner === 1 && styles.winnerText]} numberOfLines={1}>
          {team1Name}
        </Text>
        <Text style={[styles.simpleScore, winner === 1 && styles.winnerScore]}>
          {summary.score1}
        </Text>
        {winner === 1 && showWinner && (
          <View style={styles.winnerBadge}>
            <Ionicons name="trophy" size={16} color={COLORS.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>VS</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      
      <View style={[styles.simpleTeam, winner === 2 && styles.winnerTeam]}>
        {match?.isTeamMatch ? (
          <View style={[styles.teamIcon, { backgroundColor: COLORS.secondary + '20' }]}>
            <Ionicons name="people" size={24} color={COLORS.secondary} />
          </View>
        ) : (
          <Image 
            source={{ uri: player2?.avatar || 'https://via.placeholder.com/50' }} 
            style={styles.playerAvatar}
          />
        )}
        <Text style={[styles.simpleTeamName, winner === 2 && styles.winnerText]} numberOfLines={1}>
          {team2Name}
        </Text>
        <Text style={[styles.simpleScore, winner === 2 && styles.winnerScore]}>
          {summary.score2}
        </Text>
        {winner === 2 && showWinner && (
          <View style={styles.winnerBadge}>
            <Ionicons name="trophy" size={16} color={COLORS.primary} />
          </View>
        )}
      </View>
    </View>
  );

  // Render cricket scorecard
  const renderCricketScorecard = () => (
    <View style={styles.cricketContainer}>
      <View style={[styles.cricketTeam, winner === 1 && styles.winnerRow]}>
        <View style={styles.cricketTeamInfo}>
          <Text style={[styles.cricketTeamName, winner === 1 && styles.winnerText]}>{team1Name}</Text>
          {winner === 1 && <Ionicons name="trophy" size={14} color={COLORS.primary} />}
        </View>
        <View style={styles.cricketScoreInfo}>
          <Text style={styles.cricketRuns}>{scores?.runs?.player1 || 0}</Text>
          <Text style={styles.cricketWickets}>/{scores?.wickets?.player1 || 0}</Text>
          <Text style={styles.cricketOvers}>({scores?.overs?.player1 || '0.0'} ov)</Text>
        </View>
      </View>
      
      <View style={[styles.cricketTeam, winner === 2 && styles.winnerRow]}>
        <View style={styles.cricketTeamInfo}>
          <Text style={[styles.cricketTeamName, winner === 2 && styles.winnerText]}>{team2Name}</Text>
          {winner === 2 && <Ionicons name="trophy" size={14} color={COLORS.primary} />}
        </View>
        <View style={styles.cricketScoreInfo}>
          <Text style={styles.cricketRuns}>{scores?.runs?.player2 || 0}</Text>
          <Text style={styles.cricketWickets}>/{scores?.wickets?.player2 || 0}</Text>
          <Text style={styles.cricketOvers}>({scores?.overs?.player2 || '0.0'} ov)</Text>
        </View>
      </View>
      
      {scores?.result && (
        <Text style={styles.cricketResult}>{scores.result}</Text>
      )}
    </View>
  );

  // Choose renderer based on sport type
  const renderScorecard = () => {
    if (compact) return renderSimpleScorecard();
    
    switch (config.type) {
      case 'sets':
        return renderSetsScorecard();
      case 'quarters':
      case 'halves':
      case 'periods':
        return renderQuartersScorecard();
      case 'innings':
        return sportName === 'Cricket' ? renderCricketScorecard() : renderSimpleScorecard();
      default:
        return renderSimpleScorecard();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sportHeader}>
        <Text style={styles.sportEmoji}>{getSportEmoji(sportName)}</Text>
        <Text style={styles.sportName}>{sportName}</Text>
        {isLive && (
          <View style={styles.liveIndicatorSmall}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>
        )}
      </View>
      {renderScorecard()}
      {match?.status === 'completed' && winner > 0 && showWinner && (
        <View style={styles.winnerAnnouncement}>
          <Ionicons name="trophy" size={16} color={COLORS.primary} />
          <Text style={styles.winnerAnnouncementText}>
            {winner === 1 ? team1Name : team2Name} Won!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sportEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  sportName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  liveIndicatorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 4,
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.error,
  },
  
  // Sets scorecard (Tennis, Badminton, etc.)
  setsContainer: {
    marginTop: SPACING.sm,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  playerColumn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setPeriodColumn: {
    width: 32,
    alignItems: 'center',
  },
  setPeriodLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalColumn: {
    width: 40,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 2,
  },
  winnerRow: {
    backgroundColor: COLORS.primary + '10',
  },
  playerName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
  },
  setScoreColumn: {
    width: 32,
    alignItems: 'center',
  },
  setScore: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  winningSetScore: {
    color: COLORS.text,
    fontWeight: '700',
  },
  totalScore: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  winnerScore: {
    color: COLORS.primary,
  },
  winnerText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  
  // Quarters scorecard (Basketball, etc.)
  quartersContainer: {
    marginTop: SPACING.sm,
  },
  quartersHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  teamColumnWide: {
    flex: 2,
  },
  quarterColumn: {
    width: 28,
    alignItems: 'center',
  },
  quarterLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalColumnWide: {
    width: 36,
    alignItems: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 2,
  },
  teamNameText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  quarterScore: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  totalScoreLarge: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  // Simple scorecard
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  simpleTeam: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  winnerTeam: {
    backgroundColor: COLORS.primary + '10',
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: SPACING.sm,
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  simpleTeamName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  simpleScore: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  winnerBadge: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  vsText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // Cricket scorecard
  cricketContainer: {
    marginTop: SPACING.sm,
  },
  cricketTeam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 4,
  },
  cricketTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cricketTeamName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  cricketScoreInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cricketRuns: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  cricketWickets: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  cricketOvers: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  cricketResult: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  // Winner announcement
  winnerAnnouncement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  winnerAnnouncementText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
});

export default SportScorecard;
