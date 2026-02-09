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
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const CreateMatchScreen = ({ navigation }) => {
  const { createMatch, sports, fetchSports } = useMatch();
  const [name, setName] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isTeamMatch, setIsTeamMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 1on1 specific
  const [opponent, setOpponent] = useState('');
  
  // Team match specific
  const [teamName, setTeamName] = useState('');
  const [teamPlayers, setTeamPlayers] = useState('');
  const [opponentTeamName, setOpponentTeamName] = useState('');
  const [opponentPlayers, setOpponentPlayers] = useState('');

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
    // Validate common fields
    if (!name || !selectedSport || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate team match specific fields
    if (isTeamMatch) {
      if (!teamName || !opponentTeamName) {
        Alert.alert('Error', 'Please enter both team names');
        return;
      }
      if (!teamPlayers || !opponentPlayers) {
        Alert.alert('Error', 'Please enter players for both teams');
        return;
      }
    } else {
      // 1on1 match validation
      if (!opponent) {
        Alert.alert('Error', 'Please enter your opponent');
        return;
      }
    }

    setLoading(true);
    
    const matchData = {
      name,
      sport: selectedSport._id || selectedSport.name,
      location,
      date: date.toISOString(),
      isTeamMatch,
    };

    // Add team-specific or 1on1-specific data
    if (isTeamMatch) {
      matchData.teams = [
        {
          name: teamName,
          players: teamPlayers.split(',').map(p => p.trim()).filter(p => p),
        },
        {
          name: opponentTeamName,
          players: opponentPlayers.split(',').map(p => p.trim()).filter(p => p),
        },
      ];
    } else {
      matchData.opponent = opponent;
    }

    const result = await createMatch(matchData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Match created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Set Match</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Type Toggle */}
        <View style={styles.matchTypeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isTeamMatch && styles.toggleBtnActive]}
            onPress={() => setIsTeamMatch(false)}
          >
            <Text style={[styles.toggleBtnText, !isTeamMatch && styles.toggleBtnTextActive]}>
              1 on 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isTeamMatch && styles.toggleBtnActive]}
            onPress={() => setIsTeamMatch(true)}
          >
            <Text style={[styles.toggleBtnText, isTeamMatch && styles.toggleBtnTextActive]}>
              Team Match
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          {/* Left Column for Team Match */}
          {isTeamMatch ? (
            <View style={styles.formColumns}>
              {/* Left Side - Your Team */}
              <View style={styles.formColumn}>
                <Text style={styles.label}>Match Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="trophy" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Championship Final"
                    placeholderTextColor={COLORS.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <Text style={styles.label}>Choose sport *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="basketball" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tennis"
                    placeholderTextColor={COLORS.textLight}
                    value={selectedSport?.name || ''}
                    onChangeText={(text) => setSelectedSport({ name: text })}
                  />
                </View>

                <Text style={styles.label}>Choose date & time *</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.inputText}>
                    {date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}, {formatTime(date)}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Choose venue *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={18} color={COLORS.error} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter a location"
                    placeholderTextColor={COLORS.textLight}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              {/* Right Side - Opponent Team */}
              <View style={styles.formColumn}>
                <Text style={styles.label}>Choose team name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="flag" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Fisko FC"
                    placeholderTextColor={COLORS.textLight}
                    value={teamName}
                    onChangeText={setTeamName}
                  />
                </View>

                <Text style={styles.label}>Select Players (1st as Leader) *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="people" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="john, batista, alex"
                    placeholderTextColor={COLORS.textLight}
                    value={teamPlayers}
                    onChangeText={setTeamPlayers}
                  />
                </View>

                <Text style={styles.label}>Choose Opponent's team name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="flag" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Fisko FC"
                    placeholderTextColor={COLORS.textLight}
                    value={opponentTeamName}
                    onChangeText={setOpponentTeamName}
                  />
                </View>

                <Text style={styles.label}>Select Opponent (1st as Leader)*</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="people" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="john, batista, alex"
                    placeholderTextColor={COLORS.textLight}
                    value={opponentPlayers}
                    onChangeText={setOpponentPlayers}
                  />
                </View>
              </View>
            </View>
          ) : (
            /* 1 on 1 Form */
            <View>
              <Text style={styles.label}>Match Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="trophy" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Championship Final"
                  placeholderTextColor={COLORS.textLight}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.label}>Choose sport *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="basketball" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Tennis"
                  placeholderTextColor={COLORS.textLight}
                  value={selectedSport?.name || ''}
                  onChangeText={(text) => setSelectedSport({ name: text })}
                />
              </View>

              <Text style={styles.label}>Choose opponent</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="john"
                  placeholderTextColor={COLORS.textLight}
                  value={opponent}
                  onChangeText={setOpponent}
                />
              </View>

              <Text style={styles.label}>Choose date & time *</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={18} color={COLORS.textSecondary} />
                <Text style={styles.inputText}>
                  {date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}, {formatTime(date)}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Choose venue *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location" size={18} color={COLORS.error} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter a location"
                  placeholderTextColor={COLORS.textLight}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
          )}
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

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Fisiko is NOT liable for any wager or bets placed on the matches by anyone including players, spectators or anyone else
          </Text>
        </View>
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
            <Text style={styles.createButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    width: 28,
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
  matchTypeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.text,
  },
  toggleBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  toggleBtnTextActive: {
    color: COLORS.white,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  formColumns: {
    flexDirection: 'row',
  },
  formColumn: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
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
  inputText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  disclaimerContainer: {
    backgroundColor: COLORS.error + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  disclaimerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxxl,
    minWidth: 120,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default CreateMatchScreen;
