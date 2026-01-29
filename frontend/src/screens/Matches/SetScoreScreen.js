import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const SetScoreScreen = ({ navigation, route }) => {
  const { match } = route.params;
  const { updateScore } = useMatch();
  const [scores, setScores] = useState({
    team1: match.scores?.team1?.toString() || '0',
    team2: match.scores?.team2?.toString() || '0',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateScore = async () => {
    setLoading(true);
    const result = await updateScore(match._id, {
      team1: parseInt(scores.team1) || 0,
      team2: parseInt(scores.team2) || 0,
    });
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Score</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.matchName}>{match.name}</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.teamScoreSection}>
            <View style={styles.teamAvatar}>
              <Ionicons name="people" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.teamName}>
              {match.teams?.[0]?.team?.name || 'Team 1'}
            </Text>
            <View style={styles.scoreControls}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => decrementScore('team1')}
              >
                <Ionicons name="remove" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TextInput
                style={styles.scoreInput}
                value={scores.team1}
                onChangeText={(text) =>
                  setScores((prev) => ({ ...prev, team1: text.replace(/[^0-9]/g, '') }))
                }
                keyboardType="number-pad"
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => incrementScore('team1')}
              >
                <Ionicons name="add" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.teamScoreSection}>
            <View style={[styles.teamAvatar, styles.teamAvatarSecondary]}>
              <Ionicons name="people" size={32} color={COLORS.secondary} />
            </View>
            <Text style={styles.teamName}>
              {match.teams?.[1]?.team?.name || 'Team 2'}
            </Text>
            <View style={styles.scoreControls}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => decrementScore('team2')}
              >
                <Ionicons name="remove" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TextInput
                style={styles.scoreInput}
                value={scores.team2}
                onChangeText={(text) =>
                  setScores((prev) => ({ ...prev, team2: text.replace(/[^0-9]/g, '') }))
                }
                keyboardType="number-pad"
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => incrementScore('team2')}
              >
                <Ionicons name="add" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Once you submit the score, other admins will need to confirm it before it becomes final.
          </Text>
        </View>
      </ScrollView>

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
});

export default SetScoreScreen;
