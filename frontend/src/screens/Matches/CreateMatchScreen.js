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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useMatch } from '../../context/MatchContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const STEPS = ['Match Info', 'Players', 'Venue & Time'];

const CreateMatchScreen = ({ navigation }) => {
  const { createMatch, sports, fetchSports, searchFacilities } = useMatch();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Match details
  const [name, setName] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [isTeamMatch, setIsTeamMatch] = useState(false);

  // 1on1 specific
  const [opponent, setOpponent] = useState('');
  const [showOpponentSuggestions, setShowOpponentSuggestions] = useState(false);

  // Team match specific
  const [teamName, setTeamName] = useState('');
  const [teamPlayers, setTeamPlayers] = useState('');
  const [opponentTeamName, setOpponentTeamName] = useState('');
  const [opponentPlayers, setOpponentPlayers] = useState('');

  // Venue
  const [venueName, setVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');
  const [venueCountry, setVenueCountry] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Date/time
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Sport picker
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [customSport, setCustomSport] = useState('');

  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Facility
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityOptions, setFacilityOptions] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [showFacilityPicker, setShowFacilityPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const sportNameForFilter = (selectedSport?.name || '').trim();

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (!sportNameForFilter) {
      setFacilityOptions([]);
      return;
    }
    const city = venueCity.trim();
    if (!city) {
      setFacilityOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setFacilitiesLoading(true);
      const list = await searchFacilities({
        sport: sportNameForFilter,
        city,
        ...(venueState.trim() ? { state: venueState.trim() } : {}),
      });
      setFacilityOptions(list);
      setFacilitiesLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [sportNameForFilter, venueCity, venueState]);

  useEffect(() => {
    if (!selectedFacility || facilityOptions.length === 0) return;
    const stillThere = facilityOptions.some((f) => f._id === selectedFacility._id);
    if (!stillThere) setSelectedFacility(null);
  }, [facilityOptions]);

  const searchUsers = async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery) searchUsers(userSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleAutoLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access in your device settings to auto-fill your location.');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo) {
        if (geo.city) setVenueCity(geo.city);
        if (geo.region) setVenueState(geo.region);
        if (geo.country) setVenueCountry(geo.country);
        setSelectedFacility(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not detect location. Please enter manually.');
    }
    setLocationLoading(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setTimeout(() => setShowTimePicker(true), 300);
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

  const validateStep = () => {
    if (currentStep === 0) {
      if (!name.trim()) { Alert.alert('Required', 'Please enter a match name'); return false; }
      if (!selectedSport) { Alert.alert('Required', 'Please select a sport'); return false; }
      return true;
    }
    if (currentStep === 1) {
      if (isTeamMatch) {
        if (!teamName.trim() || !opponentTeamName.trim()) { Alert.alert('Required', 'Please enter both team names'); return false; }
        if (!teamPlayers.trim() || !opponentPlayers.trim()) { Alert.alert('Required', 'Please enter players for both teams'); return false; }
      } else {
        if (!opponent.trim()) { Alert.alert('Required', 'Please enter your opponent'); return false; }
      }
      return true;
    }
    if (currentStep === 2) {
      if (!venueName.trim()) { Alert.alert('Required', 'Please enter a venue name'); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleCreate = async () => {
    if (!validateStep()) return;

    setLoading(true);
    const location = [venueName, venueCity, venueState, venueCountry].filter(Boolean).join(', ');

    const matchData = {
      name,
      sport: selectedSport._id || selectedSport.name,
      location,
      date: date.toISOString(),
      isTeamMatch,
    };

    if (isTeamMatch) {
      matchData.teams = [
        { name: teamName, players: teamPlayers.split(',').map(p => p.trim()).filter(p => p) },
        { name: opponentTeamName, players: opponentPlayers.split(',').map(p => p.trim()).filter(p => p) },
      ];
    } else {
      matchData.opponent = opponent;
    }

    const result = await createMatch(matchData);
    setLoading(false);

    if (result.success) {
      if (selectedFacility?._id) {
        Alert.alert(
          'Match Created! 🎉',
          'Would you like to book this facility for your match?',
          [
            { text: 'Later', style: 'cancel', onPress: () => navigation.goBack() },
            {
              text: 'Book Facility',
              onPress: () => navigation.navigate('BookFacility', { facility: selectedFacility, initialDate: date.toISOString() }),
            },
          ]
        );
      } else {
        Alert.alert('Match Created! 🎉', 'Your match has been set up successfully!', [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to create match');
    }
  };

  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const defaultSports = [
    { _id: '1', name: 'Football' }, { _id: '2', name: 'Basketball' }, { _id: '3', name: 'Tennis' },
    { _id: '4', name: 'Cricket' }, { _id: '5', name: 'Badminton' }, { _id: '6', name: 'Pickleball' },
    { _id: '7', name: 'Padel' }, { _id: '8', name: 'Golf' }, { _id: '9', name: 'Swimming' },
    { _id: '10', name: 'Table Tennis' }, { _id: '11', name: 'Volleyball' }, { _id: '12', name: 'Baseball' },
    { _id: '13', name: 'Hockey' }, { _id: '14', name: 'Rugby' }, { _id: '15', name: 'Boxing' },
  ];
  const displaySports = sports.length > 0 ? sports : defaultSports;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, idx) => (
        <React.Fragment key={idx}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, idx <= currentStep && styles.stepCircleActive, idx < currentStep && styles.stepCircleDone]}>
              {idx < currentStep
                ? <Ionicons name="checkmark" size={14} color={COLORS.white} />
                : <Text style={[styles.stepNum, idx <= currentStep && styles.stepNumActive]}>{idx + 1}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, idx === currentStep && styles.stepLabelActive]}>{step}</Text>
          </View>
          {idx < STEPS.length - 1 && (
            <View style={[styles.stepLine, idx < currentStep && styles.stepLineDone]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View>
      <Text style={styles.sectionTitle}>What's the match about?</Text>

      <Text style={styles.label}>Match Name *</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="trophy-outline" size={18} color={COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunday League Final"
          placeholderTextColor={COLORS.textLight}
          value={name}
          onChangeText={setName}
        />
      </View>

      <Text style={styles.label}>Choose Sport *</Text>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setShowSportPicker(true)}>
        <Ionicons name="basketball-outline" size={18} color={COLORS.primary} />
        <Text style={[styles.inputText, !selectedSport && { color: COLORS.textLight }]}>
          {selectedSport?.name || 'Select a sport'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>Match Format</Text>
      <View style={styles.formatToggle}>
        <TouchableOpacity
          style={[styles.formatBtn, !isTeamMatch && styles.formatBtnActive]}
          onPress={() => setIsTeamMatch(false)}
        >
          <Ionicons name="person-outline" size={18} color={!isTeamMatch ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.formatBtnText, !isTeamMatch && styles.formatBtnTextActive]}>1 on 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formatBtn, isTeamMatch && styles.formatBtnActive]}
          onPress={() => setIsTeamMatch(true)}
        >
          <Ionicons name="people-outline" size={18} color={isTeamMatch ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.formatBtnText, isTeamMatch && styles.formatBtnTextActive]}>Team Match</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View>
      {isTeamMatch ? (
        <>
          <Text style={styles.sectionTitle}>Set up your teams</Text>

          <View style={styles.teamSection}>
            <View style={[styles.teamHeader, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="flag" size={16} color={COLORS.primary} />
              <Text style={[styles.teamHeaderText, { color: COLORS.primary }]}>Your Team</Text>
            </View>
            <Text style={styles.label}>Team Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Fisiko FC"
                placeholderTextColor={COLORS.textLight}
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>
            <Text style={styles.label}>Players (comma separated) *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="John, Alex, Maria..."
                placeholderTextColor={COLORS.textLight}
                value={teamPlayers}
                onChangeText={setTeamPlayers}
              />
            </View>
          </View>

          <View style={styles.vsRow}>
            <View style={styles.vsLine} />
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.vsLine} />
          </View>

          <View style={styles.teamSection}>
            <View style={[styles.teamHeader, { backgroundColor: COLORS.secondary + '15' }]}>
              <Ionicons name="flag" size={16} color={COLORS.secondary} />
              <Text style={[styles.teamHeaderText, { color: COLORS.secondary }]}>Opponent Team</Text>
            </View>
            <Text style={styles.label}>Team Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rivals United"
                placeholderTextColor={COLORS.textLight}
                value={opponentTeamName}
                onChangeText={setOpponentTeamName}
              />
            </View>
            <Text style={styles.label}>Players (comma separated) *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Sarah, Tom, Chris..."
                placeholderTextColor={COLORS.textLight}
                value={opponentPlayers}
                onChangeText={setOpponentPlayers}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Who are you challenging?</Text>
          <View style={styles.opponentContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              <TextInput
                style={styles.input}
                placeholder="Search by @username"
                placeholderTextColor={COLORS.textLight}
                value={opponent}
                onChangeText={(text) => {
                  setOpponent(text);
                  if (text.length > 0) { setShowOpponentSuggestions(true); setUserSearchQuery(text); }
                  else { setShowOpponentSuggestions(false); }
                }}
                onFocus={() => opponent.length > 0 && setShowOpponentSuggestions(true)}
              />
              {searchLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>

            {showOpponentSuggestions && searchResults.length > 0 && (
              <View style={styles.suggestionsDropdown}>
                {searchResults.slice(0, 5).map((user) => (
                  <TouchableOpacity
                    key={user._id}
                    style={styles.suggestionItem}
                    onPress={() => { setOpponent(user.userName || user.email); setShowOpponentSuggestions(false); }}
                  >
                    <View style={styles.suggestionAvatar}>
                      <Ionicons name="person" size={16} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.suggestionText}>{user.userName || user.name}</Text>
                      <Text style={styles.suggestionEmail}>{user.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>When & Where?</Text>

      <Text style={styles.label}>Date & Time *</Text>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
        <Text style={styles.inputText}>
          {formatDate(date)}, {formatTime(date)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>Venue Name *</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={18} color={COLORS.error} />
        <TextInput
          style={styles.input}
          placeholder="e.g. Central Park Courts"
          placeholderTextColor={COLORS.textLight}
          value={venueName}
          onChangeText={setVenueName}
        />
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.label}>City & Country</Text>
        <TouchableOpacity style={styles.autoLocationBtn} onPress={handleAutoLocation} disabled={locationLoading}>
          {locationLoading
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <><Ionicons name="navigate" size={14} color={COLORS.primary} /><Text style={styles.autoLocationText}>Auto-detect</Text></>
          }
        </TouchableOpacity>
      </View>

      <View style={styles.venueRowInputs}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor={COLORS.textLight}
            value={venueCity}
            onChangeText={(t) => { setVenueCity(t); setSelectedFacility(null); }}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor={COLORS.textLight}
            value={venueState}
            onChangeText={(t) => { setVenueState(t); setSelectedFacility(null); }}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="globe-outline" size={18} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Country"
          placeholderTextColor={COLORS.textLight}
          value={venueCountry}
          onChangeText={setVenueCountry}
        />
      </View>

      <Text style={styles.label}>Facility (optional)</Text>
      <Text style={styles.facilityHint}>
        We'll show nearby {selectedSport?.name || 'sport'} venues in your city.
      </Text>
      <TouchableOpacity
        style={[styles.inputContainer, (!sportNameForFilter || !venueCity.trim()) && styles.inputDisabled]}
        onPress={() => setShowFacilityPicker(true)}
        disabled={!sportNameForFilter || !venueCity.trim()}
      >
        <Ionicons name="business-outline" size={18} color={COLORS.primary} />
        <Text style={[styles.inputText, !selectedFacility && { color: COLORS.textLight }]} numberOfLines={1}>
          {!sportNameForFilter || !venueCity.trim()
            ? 'Select sport & city first'
            : selectedFacility ? selectedFacility.name : 'Choose a facility (optional)'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {facilitiesLoading && <ActivityIndicator style={{ marginTop: SPACING.sm }} color={COLORS.primary} />}

      <View style={styles.disclaimerContainer}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.error} />
        <Text style={styles.disclaimerText}>
          Fisiko is NOT liable for any wager or bets placed on matches.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => currentStep === 0 ? navigation.goBack() : setCurrentStep(p => p - 1)}>
          <Ionicons name={currentStep === 0 ? 'close' : 'arrow-back'} size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set a Match</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.pickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => { setShowDatePicker(false); setTimeout(() => setShowTimePicker(true), 300); }}>
                      <Text style={styles.pickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker value={date} mode="date" display="spinner" onChange={(e, d) => { if (d) setDate(d); }} minimumDate={new Date()} style={{ height: 200 }} />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />
          )
        )}

        {showTimePicker && (
          Platform.OS === 'ios' ? (
            <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.pickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerTitle}>Select Time</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.pickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker value={date} mode="time" display="spinner" onChange={(e, t) => { if (t) { const nd = new Date(date); nd.setHours(t.getHours()); nd.setMinutes(t.getMinutes()); setDate(nd); } }} style={{ height: 200 }} />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker value={date} mode="time" display="default" onChange={handleTimeChange} />
          )
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sport Picker Modal */}
      <Modal visible={showSportPicker} transparent animationType="slide" onRequestClose={() => setShowSportPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport</Text>
              <TouchableOpacity onPress={() => setShowSportPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.customSportContainer}>
              <View style={styles.customSportRow}>
                <TextInput
                  style={styles.customSportInput}
                  placeholder="Or enter custom sport..."
                  placeholderTextColor={COLORS.textLight}
                  value={customSport}
                  onChangeText={setCustomSport}
                />
                <TouchableOpacity
                  style={[styles.customSportBtn, !customSport.trim() && styles.customSportBtnDisabled]}
                  disabled={!customSport.trim()}
                  onPress={() => { if (customSport.trim()) { setSelectedSport({ _id: `custom_${Date.now()}`, name: customSport.trim() }); setCustomSport(''); setShowSportPicker(false); } }}
                >
                  <Text style={styles.customSportBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={displaySports}
              keyExtractor={(item) => item._id || item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sportItem}
                  onPress={() => { setSelectedSport(item); setSelectedFacility(null); setCustomSport(''); setShowSportPicker(false); }}
                >
                  <Text style={styles.sportItemText}>{item.name}</Text>
                  {selectedSport?.name === item.name && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Facility Picker Modal */}
      <Modal visible={showFacilityPicker} transparent animationType="slide" onRequestClose={() => setShowFacilityPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Facility</Text>
              <TouchableOpacity onPress={() => setShowFacilityPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {facilitiesLoading ? (
              <ActivityIndicator style={{ marginTop: SPACING.xl }} color={COLORS.primary} />
            ) : (
              <FlatList
                data={facilityOptions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.sportItem}
                    onPress={() => { setSelectedFacility(item); setVenueName(item.name); setShowFacilityPicker(false); }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sportItemText}>{item.name}</Text>
                      <Text style={styles.facilityListSub} numberOfLines={1}>{item.location}{item.rating != null ? ` · ★ ${item.rating}` : ''}</Text>
                    </View>
                    {selectedFacility?._id === item._id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No facilities found for this sport and city.</Text>}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {currentStep < STEPS.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.createButton, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create Match</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepCircleDone: { backgroundColor: COLORS.success },
  stepNum: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  stepNumActive: { color: COLORS.white },
  stepLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: SPACING.xs, marginBottom: 18 },
  stepLineDone: { backgroundColor: COLORS.success },
  content: { flex: 1, padding: SPACING.lg },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
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
  inputDisabled: { opacity: 0.5 },
  input: { flex: 1, marginLeft: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.text },
  inputText: { flex: 1, marginLeft: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.text },
  formatToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  formatBtnActive: { backgroundColor: COLORS.primary },
  formatBtnText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textSecondary },
  formatBtnTextActive: { color: COLORS.white },
  teamSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  teamHeaderText: { fontSize: FONTS.sizes.md, fontWeight: '700' },
  vsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  vsLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  vsText: { marginHorizontal: SPACING.md, fontWeight: '800', fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  opponentContainer: { position: 'relative', zIndex: 100 },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    zIndex: 1000,
    ...SHADOWS.medium,
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  suggestionText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  suggestionEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autoLocationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.primary + '15', borderRadius: BORDER_RADIUS.full },
  autoLocationText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  venueRowInputs: { flexDirection: 'row', marginTop: SPACING.sm, marginBottom: SPACING.sm },
  facilityHint: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  facilityListSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.error + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  disclaimerText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.error, lineHeight: 18 },
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xxl, borderTopRightRadius: BORDER_RADIUS.xxl, paddingBottom: SPACING.xl },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  pickerCancel: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  pickerDone: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xxl, borderTopRightRadius: BORDER_RADIUS.xxl, maxHeight: '70%', paddingBottom: SPACING.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  customSportContainer: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  customSportRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  customSportInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  customSportBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  customSportBtnDisabled: { backgroundColor: COLORS.border },
  customSportBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
  sportItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sportItemText: { fontSize: FONTS.sizes.md, color: COLORS.text },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.xl, fontSize: FONTS.sizes.md },
  footer: { padding: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  nextButtonText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  createButtonText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default CreateMatchScreen;
