import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const SKILL_LEVELS = ['Beginner', 'Foundation', 'Intermediate', 'Advance', 'Pro'];

const SPORTS_ICONS = {
  Football: 'football',
  Basketball: 'basketball',
  Tennis: 'tennisball',
  Cricket: 'baseball',
  Swimming: 'water',
  Running: 'walk',
  Cycling: 'bicycle',
  Volleyball: 'basketball-outline',
  Badminton: 'tennisball-outline',
  Golf: 'golf',
  Hockey: 'hockey-puck',
  Boxing: 'fitness',
  Yoga: 'body',
  Gym: 'barbell',
  default: 'trophy',
};

const PassionScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { sports, fetchSports } = useMatch();
  const [selectedPassions, setSelectedPassions] = useState(user?.passions || []);
  const [loading, setLoading] = useState(true);
  const [currentSport, setCurrentSport] = useState(null);
  const [showSkillModal, setShowSkillModal] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    await fetchSports();
    setLoading(false);
  };

  const handleSportSelect = (sport) => {
    const existing = selectedPassions.find((p) => p.name === sport.name);
    if (existing) {
      setSelectedPassions(selectedPassions.filter((p) => p.name !== sport.name));
    } else {
      setCurrentSport(sport);
      setShowSkillModal(true);
    }
  };

  const handleSkillSelect = (skillLevel) => {
    setSelectedPassions([
      ...selectedPassions,
      { name: currentSport.name, skillLevel },
    ]);
    setShowSkillModal(false);
    setCurrentSport(null);
  };

  const handleNext = async () => {
    if (selectedPassions.length === 0) return;

    await updateUser({ passions: selectedPassions });
    navigation.navigate('UploadPicture');
  };

  const isSelected = (sportName) =>
    selectedPassions.some((p) => p.name === sportName);

  const getSkillLevel = (sportName) => {
    const passion = selectedPassions.find((p) => p.name === sportName);
    return passion?.skillLevel;
  };

  const getIcon = (sportName) => {
    return SPORTS_ICONS[sportName] || SPORTS_ICONS.default;
  };

  const defaultSports = [
    { name: 'Football', _id: '1' },
    { name: 'Basketball', _id: '2' },
    { name: 'Tennis', _id: '3' },
    { name: 'Cricket', _id: '4' },
    { name: 'Swimming', _id: '5' },
    { name: 'Running', _id: '6' },
    { name: 'Cycling', _id: '7' },
    { name: 'Volleyball', _id: '8' },
    { name: 'Badminton', _id: '9' },
    { name: 'Gym', _id: '10' },
  ];

  const displaySports = sports.length > 0 ? sports : defaultSports;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.step}>Step 2 of 4</Text>
          <Text style={styles.title}>What are your passions?</Text>
          <Text style={styles.subtitle}>
            Select the sports you love and your skill level
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <View style={styles.sportsGrid}>
            {displaySports.map((sport) => (
              <TouchableOpacity
                key={sport._id}
                style={[
                  styles.sportCard,
                  isSelected(sport.name) && styles.sportCardSelected,
                ]}
                onPress={() => handleSportSelect(sport)}
              >
                <View
                  style={[
                    styles.sportIconContainer,
                    isSelected(sport.name) && styles.sportIconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={getIcon(sport.name)}
                    size={28}
                    color={isSelected(sport.name) ? COLORS.white : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.sportName,
                    isSelected(sport.name) && styles.sportNameSelected,
                  ]}
                >
                  {sport.name}
                </Text>
                {isSelected(sport.name) && (
                  <Text style={styles.skillBadge}>{getSkillLevel(sport.name)}</Text>
                )}
                {isSelected(sport.name) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedPassions.length} sport{selectedPassions.length !== 1 ? 's' : ''} selected
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedPassions.length === 0 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedPassions.length === 0}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>

      {showSkillModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              What's your {currentSport?.name} skill level?
            </Text>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.skillOption}
                onPress={() => handleSkillSelect(level)}
              >
                <Text style={styles.skillOptionText}>{level}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowSkillModal(false);
                setCurrentSport(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  step: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  sportCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  sportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sportIconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  sportName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sportNameSelected: {
    color: COLORS.primary,
  },
  skillBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  selectedCount: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  selectedCountText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  skillOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  skillOptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  cancelButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default PassionScreen;
