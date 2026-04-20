import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';

const COMMON_AMENITIES = [
  'Parking',
  'Changing Rooms',
  'Showers',
  'Lights',
  'Water',
  'Equipment Rental',
  'Cafeteria',
  'Wi-Fi',
  'First Aid',
  'Spectator Area',
];

const AddFacilityScreen = ({ navigation }) => {
  const { createFacility, suggestFacilities } = useMatch();
  const [availableSports, setAvailableSports] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');

  // Typeahead state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);

  // Prefill from an existing suggestion
  const [filledFromSuggestion, setFilledFromSuggestion] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_SPORTS);
      setAvailableSports(res.data.sports || res.data || []);
    } catch {}
  };

  // Debounced name search for typeahead
  const handleNameChange = useCallback((text) => {
    setName(text);
    setFilledFromSuggestion(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSuggestionsLoading(true);
    setShowSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      const results = await suggestFacilities(text.trim());
      setSuggestions(results);
      setSuggestionsLoading(false);
    }, 350);
  }, [suggestFacilities]);

  const selectSuggestion = (facility) => {
    Keyboard.dismiss();
    setName(facility.name);
    setLocation(facility.location || '');
    setDescription(facility.description || '');
    setPricePerHour(facility.pricePerHour?.toString() || '');
    setSelectedSports(facility.sports || []);
    setSelectedAmenities(facility.amenities || []);
    if (facility.openingHours) {
      setOpenTime(facility.openingHours.open || '06:00');
      setCloseTime(facility.openingHours.close || '22:00');
    }
    setFilledFromSuggestion(true);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const toggleSport = (sportName) => {
    setSelectedSports((prev) =>
      prev.includes(sportName) ? prev.filter((s) => s !== sportName) : [...prev, sportName]
    );
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const validate = () => {
    if (!name.trim()) { Alert.alert('Missing name', 'Please enter a facility name.'); return false; }
    if (!location.trim()) { Alert.alert('Missing location', 'Please enter the facility address or area.'); return false; }
    if (!pricePerHour || isNaN(Number(pricePerHour)) || Number(pricePerHour) <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid hourly price.'); return false;
    }
    if (selectedSports.length === 0) { Alert.alert('Select a sport', 'Please choose at least one sport.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const result = await createFacility({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      pricePerHour: Number(pricePerHour),
      sports: selectedSports,
      amenities: selectedAmenities,
      openingHours: { open: openTime, close: closeTime },
    });
    setSubmitting(false);

    if (result.success) {
      Alert.alert('Facility Added!', `"${result.facility.name}" has been added and is now visible to everyone.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Something went wrong. Try again.');
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => selectSuggestion(item)}>
      <Ionicons name="business-outline" size={18} color={COLORS.primary} style={styles.suggestionIcon} />
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.suggestionLocation} numberOfLines={1}>
          <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} /> {item.location}
        </Text>
      </View>
      {item.rating > 0 && (
        <View style={styles.suggestionRating}>
          <Ionicons name="star" size={12} color={COLORS.warning} />
          <Text style={styles.suggestionRatingText}>{item.rating.toFixed(1)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Facility</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Name with typeahead */}
          <View style={styles.field}>
            <Text style={styles.label}>Facility Name *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="business" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Green Park Cricket Ground"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={handleNameChange}
                returnKeyType="next"
              />
              {suggestionsLoading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: SPACING.sm }} />}
            </View>

            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                <Text style={styles.suggestionsHint}>Nearby facilities matching "{name}"</Text>
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item) => item._id}
                  nestedScrollEnabled
                  style={styles.suggestionsList}
                />
              </View>
            )}

            {filledFromSuggestion && (
              <View style={styles.infoChip}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.infoChipText}>Prefilled from existing facility — edit any field below</Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Location / Address *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="location" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Area, City, State"
                placeholderTextColor={COLORS.textLight}
                value={location}
                onChangeText={setLocation}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Price */}
          <View style={styles.field}>
            <Text style={styles.label}>Price per Hour (₹) *</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                placeholderTextColor={COLORS.textLight}
                value={pricePerHour}
                onChangeText={setPricePerHour}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Sports */}
          <View style={styles.field}>
            <Text style={styles.label}>Sports Available *</Text>
            <View style={styles.chipsWrap}>
              {availableSports.map((sport) => {
                const sportName = sport.name || sport;
                const active = selectedSports.includes(sportName);
                return (
                  <TouchableOpacity
                    key={sport._id || sportName}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleSport(sportName)}
                  >
                    <Text style={{ fontSize: 14 }}>{getSportEmoji(sportName)}</Text>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{sportName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.field}>
            <Text style={styles.label}>Amenities</Text>
            <View style={styles.chipsWrap}>
              {COMMON_AMENITIES.map((a) => {
                const active = selectedAmenities.includes(a);
                return (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleAmenity(a)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Hours */}
          <View style={styles.field}>
            <Text style={styles.label}>Opening Hours</Text>
            <View style={styles.hoursRow}>
              <View style={styles.hourInput}>
                <Text style={styles.hourLabel}>Opens</Text>
                <TextInput
                  style={styles.hourValue}
                  value={openTime}
                  onChangeText={setOpenTime}
                  placeholder="06:00"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <Text style={styles.hourDash}>—</Text>
              <View style={styles.hourInput}>
                <Text style={styles.hourLabel}>Closes</Text>
                <TextInput
                  style={styles.hourValue}
                  value={closeTime}
                  onChangeText={setCloseTime}
                  placeholder="22:00"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell players about this facility..."
              placeholderTextColor={COLORS.textLight}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.submitBtnText}>Add Facility</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  field: { marginBottom: SPACING.xl },
  label: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: { marginRight: SPACING.sm },
  currencySymbol: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, paddingVertical: SPACING.md },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 100,
  },

  // Typeahead suggestions
  suggestionsBox: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 220,
    ...SHADOWS.medium,
  },
  suggestionsHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  suggestionsList: { paddingHorizontal: SPACING.sm },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: { marginRight: SPACING.sm },
  suggestionText: { flex: 1 },
  suggestionName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  suggestionLocation: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  suggestionRating: { flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.sm },
  suggestionRatingText: { fontSize: FONTS.sizes.xs, color: COLORS.warning, marginLeft: 2, fontWeight: '600' },

  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '12',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  infoChipText: { fontSize: FONTS.sizes.xs, color: COLORS.success, flex: 1 },

  // Chips (sports, amenities)
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  chipTextActive: { color: COLORS.primary, fontWeight: '600' },

  // Hours
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  hourInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  hourLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  hourValue: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  hourDash: { fontSize: FONTS.sizes.xl, color: COLORS.textSecondary },

  // Footer
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '600' },
});

export default AddFacilityScreen;
