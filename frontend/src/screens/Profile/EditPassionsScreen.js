import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
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

const EditPassionsScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { sports, fetchSports } = useMatch();
  const [selectedPassions, setSelectedPassions] = useState(user?.passions || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ passions: selectedPassions });
      Alert.alert('Success', 'Your passions have been updated!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update passions');
    }
    setSaving(false);
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

  const displaySports = sports?.length > 0 ? sports : defaultSports;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Passions</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveBtn}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Select your favorite sports and skill levels
      </Text>

      <ScrollView style={styles.sportsGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {displaySports.map((sport) => (
            <TouchableOpacity
              key={sport._id || sport.name}
              style={[
                styles.sportCard,
                isSelected(sport.name) && styles.sportCardSelected,
              ]}
              onPress={() => handleSportSelect(sport)}
            >
              <View style={[
                styles.sportIconContainer,
                isSelected(sport.name) && styles.sportIconContainerSelected,
              ]}>
                <Ionicons
                  name={getIcon(sport.name)}
                  size={32}
                  color={isSelected(sport.name) ? COLORS.white : COLORS.primary}
                />
              </View>
              <Text style={[
                styles.sportName,
                isSelected(sport.name) && styles.sportNameSelected,
              ]}>
                {sport.name}
              </Text>
              {isSelected(sport.name) && (
                <View style={styles.skillBadge}>
                  <Text style={styles.skillBadgeText}>{getSkillLevel(sport.name)}</Text>
                </View>
              )}
              {isSelected(sport.name) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Skill Level Modal */}
      <Modal
        visible={showSkillModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSkillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select your skill level for {currentSport?.name}
            </Text>
            {SKILL_LEVELS.map((level, index) => (
              <TouchableOpacity
                key={level}
                style={styles.skillOption}
                onPress={() => handleSkillSelect(level)}
              >
                <View style={styles.skillDots}>
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <View
                      key={dot}
                      style={[
                        styles.skillDot,
                        dot <= index + 1 && styles.skillDotFilled,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.skillOptionText}>{level}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowSkillModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  saveBtn: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sportsGrid: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xxl,
  },
  sportCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  sportCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  sportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    textAlign: 'center',
  },
  sportNameSelected: {
    color: COLORS.primary,
  },
  skillBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  skillBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '85%',
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  skillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  skillDots: {
    flexDirection: 'row',
    marginRight: SPACING.md,
    gap: 4,
  },
  skillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  skillDotFilled: {
    backgroundColor: COLORS.primary,
  },
  skillOptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
});

export default EditPassionsScreen;
