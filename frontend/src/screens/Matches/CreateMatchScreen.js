import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const CreateMatchScreen = ({ navigation }) => {
  const { createMatch, sports, fetchSports } = useMatch();
  const [name, setName] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isTeamMatch, setIsTeamMatch] = useState(false);
  const [agreementTime, setAgreementTime] = useState('24');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleCreate = async () => {
    if (!name || !selectedSport || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await createMatch({
      name,
      sport: selectedSport._id,
      location,
      date: date.toISOString(),
      isTeamMatch,
      agreementTime: parseInt(agreementTime),
    });
    setLoading(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Failed to create match');
    }
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (d) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const defaultSports = [
    { _id: '1', name: 'Football' },
    { _id: '2', name: 'Basketball' },
    { _id: '3', name: 'Tennis' },
    { _id: '4', name: 'Cricket' },
    { _id: '5', name: 'Badminton' },
  ];

  const displaySports = sports.length > 0 ? sports : defaultSports;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Match</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Match Name *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sunday Football Game"
            placeholderTextColor={COLORS.textLight}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>Sport *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportsContainer}
        >
          {displaySports.map((sport) => (
            <TouchableOpacity
              key={sport._id}
              style={[
                styles.sportChip,
                selectedSport?._id === sport._id && styles.sportChipActive,
              ]}
              onPress={() => setSelectedSport(sport)}
            >
              <Text
                style={[
                  styles.sportChipText,
                  selectedSport?._id === sport._id && styles.sportChipTextActive,
                ]}
              >
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Location *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Enter match location"
            placeholderTextColor={COLORS.textLight}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <Text style={styles.label}>Date & Time *</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <Text style={styles.label}>Match Type</Text>
        <View style={styles.matchTypeContainer}>
          <TouchableOpacity
            style={[styles.matchTypeButton, !isTeamMatch && styles.matchTypeButtonActive]}
            onPress={() => setIsTeamMatch(false)}
          >
            <Ionicons
              name="person"
              size={24}
              color={!isTeamMatch ? COLORS.white : COLORS.text}
            />
            <Text
              style={[
                styles.matchTypeText,
                !isTeamMatch && styles.matchTypeTextActive,
              ]}
            >
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.matchTypeButton, isTeamMatch && styles.matchTypeButtonActive]}
            onPress={() => setIsTeamMatch(true)}
          >
            <Ionicons
              name="people"
              size={24}
              color={isTeamMatch ? COLORS.white : COLORS.text}
            />
            <Text
              style={[
                styles.matchTypeText,
                isTeamMatch && styles.matchTypeTextActive,
              ]}
            >
              Team
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Agreement Time (hours)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="timer-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="24"
            placeholderTextColor={COLORS.textLight}
            value={agreementTime}
            onChangeText={setAgreementTime}
            keyboardType="number-pad"
          />
        </View>
        <Text style={styles.helperText}>
          Time allowed for participants to confirm their participation
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.createButtonText}>Create Match</Text>
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
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sportsContainer: {
    flexDirection: 'row',
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  sportChipTextActive: {
    color: COLORS.white,
  },
  dateTimeRow: {
    gap: SPACING.md,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  dateTimeText: {
    marginLeft: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  matchTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  matchTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  matchTypeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  matchTypeTextActive: {
    color: COLORS.white,
  },
  helperText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
});

export default CreateMatchScreen;
