import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const { width } = Dimensions.get('window');

const SPORTS_OPTIONS = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Table Tennis', emoji: '🏓' },
  { name: 'Squash', emoji: '🎾' },
  { name: 'Hockey', emoji: '🏒' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Gym', emoji: '💪' },
];

const AMENITIES_OPTIONS = [
  { name: 'Parking', icon: 'car-outline' },
  { name: 'Changing Rooms', icon: 'shirt-outline' },
  { name: 'Showers', icon: 'water-outline' },
  { name: 'Lockers', icon: 'lock-closed-outline' },
  { name: 'Cafeteria', icon: 'cafe-outline' },
  { name: 'WiFi', icon: 'wifi-outline' },
  { name: 'First Aid', icon: 'medkit-outline' },
  { name: 'Equipment Rental', icon: 'basketball-outline' },
  { name: 'Coaching', icon: 'people-outline' },
  { name: 'Air Conditioning', icon: 'snow-outline' },
  { name: 'Floodlights', icon: 'bulb-outline' },
  { name: 'Seating Area', icon: 'people-outline' },
];

const STEPS = [
  { id: 1, title: 'Basic Info', icon: 'information-circle-outline' },
  { id: 2, title: 'Location', icon: 'location-outline' },
  { id: 3, title: 'Sports', icon: 'basketball-outline' },
  { id: 4, title: 'Pricing', icon: 'pricetag-outline' },
  { id: 5, title: 'Schedule', icon: 'time-outline' },
  { id: 6, title: 'Photos', icon: 'images-outline' },
  { id: 7, title: 'Amenities', icon: 'list-outline' },
];

const OwnerOnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const [facilityData, setFacilityData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    coordinates: { lat: null, lng: null },
    sports: [],
    pricePerHour: '',
    sportPricing: {},
    openingTime: '06:00',
    closingTime: '22:00',
    slotDuration: 60,
    images: [],
    amenities: [],
    rules: '',
  });

  const updateField = (field, value) => {
    setFacilityData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!facilityData.name || !facilityData.description) {
          Alert.alert('Error', 'Please fill in facility name and description');
          return false;
        }
        return true;
      case 2:
        if (!facilityData.address || !facilityData.city) {
          Alert.alert('Error', 'Please fill in address and city');
          return false;
        }
        return true;
      case 3:
        if (facilityData.sports.length === 0) {
          Alert.alert('Error', 'Please select at least one sport');
          return false;
        }
        return true;
      case 4:
        if (!facilityData.pricePerHour) {
          Alert.alert('Error', 'Please enter base price per hour');
          return false;
        }
        return true;
      case 5:
        return true;
      case 6:
        if (facilityData.images.length === 0) {
          Alert.alert('Error', 'Please add at least one photo');
          return false;
        }
        return true;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      updateField('coordinates', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      // Reverse geocode
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        updateField('city', address.city || '');
        updateField('state', address.region || '');
        updateField('pincode', address.postalCode || '');
      }

      Alert.alert('Success', 'Location captured successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      updateField('images', [...facilityData.images, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index) => {
    const newImages = facilityData.images.filter((_, i) => i !== index);
    updateField('images', newImages);
  };

  const toggleSport = (sport) => {
    const sports = facilityData.sports.includes(sport)
      ? facilityData.sports.filter(s => s !== sport)
      : [...facilityData.sports, sport];
    updateField('sports', sports);
  };

  const toggleAmenity = (amenity) => {
    const amenities = facilityData.amenities.includes(amenity)
      ? facilityData.amenities.filter(a => a !== amenity)
      : [...facilityData.amenities, amenity];
    updateField('amenities', amenities);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      
      // Create facility
      const res = await api.post(API_ENDPOINTS.CREATE_FACILITY, {
        name: facilityData.name,
        description: facilityData.description,
        address: facilityData.address,
        city: facilityData.city,
        state: facilityData.state,
        pincode: facilityData.pincode,
        location: `${facilityData.address}, ${facilityData.city}`,
        coordinates: facilityData.coordinates,
        sports: facilityData.sports,
        pricePerHour: parseFloat(facilityData.pricePerHour),
        sportPricing: facilityData.sportPricing,
        openingHours: {
          open: facilityData.openingTime,
          close: facilityData.closingTime,
        },
        slotDuration: facilityData.slotDuration,
        images: facilityData.images,
        amenities: facilityData.amenities,
        rules: facilityData.rules,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update owner data
      const ownerData = JSON.parse(await AsyncStorage.getItem('ownerData') || '{}');
      ownerData.onboardingComplete = true;
      ownerData.facilities = [...(ownerData.facilities || []), { _id: res.data.facility._id, name: res.data.facility.name }];
      await AsyncStorage.setItem('ownerData', JSON.stringify(ownerData));

      Alert.alert(
        'Facility Created!',
        'Your facility has been successfully listed.',
        [{ text: 'Go to Dashboard', onPress: () => navigation.replace('OwnerDashboard') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step.id && styles.stepCircleActive,
            currentStep === step.id && styles.stepCircleCurrent,
          ]}>
            {currentStep > step.id ? (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            ) : (
              <Text style={[styles.stepNumber, currentStep >= step.id && styles.stepNumberActive]}>
                {step.id}
              </Text>
            )}
          </View>
          {index < STEPS.length - 1 && (
            <View style={[styles.stepLine, currentStep > step.id && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your facility</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Facility Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Sports Arena"
          placeholderTextColor={COLORS.textLight}
          value={facilityData.name}
          onChangeText={(v) => updateField('name', v)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your facility, what makes it special..."
          placeholderTextColor={COLORS.textLight}
          value={facilityData.description}
          onChangeText={(v) => updateField('description', v)}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rules & Guidelines (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any rules visitors should know..."
          placeholderTextColor={COLORS.textLight}
          value={facilityData.rules}
          onChangeText={(v) => updateField('rules', v)}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.stepSubtitle}>Where is your facility located?</Text>

      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Ionicons name="locate" size={20} color={COLORS.primary} />
        <Text style={styles.locationButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Full street address"
          placeholderTextColor={COLORS.textLight}
          value={facilityData.address}
          onChangeText={(v) => updateField('address', v)}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor={COLORS.textLight}
            value={facilityData.city}
            onChangeText={(v) => updateField('city', v)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor={COLORS.textLight}
            value={facilityData.state}
            onChangeText={(v) => updateField('state', v)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode</Text>
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          placeholderTextColor={COLORS.textLight}
          value={facilityData.pincode}
          onChangeText={(v) => updateField('pincode', v)}
          keyboardType="numeric"
        />
      </View>

      {facilityData.coordinates.lat && (
        <View style={styles.coordinatesBox}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.coordinatesText}>Location coordinates captured</Text>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Sports Available</Text>
      <Text style={styles.stepSubtitle}>Select sports offered at your facility</Text>

      <View style={styles.sportsGrid}>
        {SPORTS_OPTIONS.map((sport) => (
          <TouchableOpacity
            key={sport.name}
            style={[
              styles.sportCard,
              facilityData.sports.includes(sport.name) && styles.sportCardSelected,
            ]}
            onPress={() => toggleSport(sport.name)}
          >
            <Text style={styles.sportEmoji}>{sport.emoji}</Text>
            <Text style={[
              styles.sportName,
              facilityData.sports.includes(sport.name) && styles.sportNameSelected,
            ]}>
              {sport.name}
            </Text>
            {facilityData.sports.includes(sport.name) && (
              <View style={styles.sportCheck}>
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pricing</Text>
      <Text style={styles.stepSubtitle}>Set your hourly rates</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Base Price per Hour (₹) *</Text>
        <View style={styles.priceInputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="500"
            placeholderTextColor={COLORS.textLight}
            value={facilityData.pricePerHour}
            onChangeText={(v) => updateField('pricePerHour', v)}
            keyboardType="numeric"
          />
          <Text style={styles.perHourText}>/ hour</Text>
        </View>
      </View>

      {facilityData.sports.length > 1 && (
        <View style={styles.sportPricingSection}>
          <Text style={styles.sportPricingTitle}>Sport-specific Pricing (Optional)</Text>
          <Text style={styles.sportPricingSubtitle}>Leave empty to use base price</Text>
          
          {facilityData.sports.map((sport) => (
            <View key={sport} style={styles.sportPriceRow}>
              <Text style={styles.sportPriceLabel}>{sport}</Text>
              <View style={styles.sportPriceInputWrap}>
                <Text style={styles.currencySmall}>₹</Text>
                <TextInput
                  style={styles.sportPriceInput}
                  placeholder={facilityData.pricePerHour || '500'}
                  placeholderTextColor={COLORS.textLight}
                  value={facilityData.sportPricing[sport]?.toString() || ''}
                  onChangeText={(v) => {
                    const newPricing = { ...facilityData.sportPricing, [sport]: v };
                    updateField('sportPricing', newPricing);
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Operating Hours</Text>
      <Text style={styles.stepSubtitle}>Set your facility's schedule</Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
          <Text style={styles.label}>Opening Time</Text>
          <TouchableOpacity style={styles.timeButton}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.timeInput}
              placeholder="06:00"
              placeholderTextColor={COLORS.textLight}
              value={facilityData.openingTime}
              onChangeText={(v) => updateField('openingTime', v)}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Closing Time</Text>
          <TouchableOpacity style={styles.timeButton}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.timeInput}
              placeholder="22:00"
              placeholderTextColor={COLORS.textLight}
              value={facilityData.closingTime}
              onChangeText={(v) => updateField('closingTime', v)}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Slot Duration</Text>
        <View style={styles.slotDurationRow}>
          {[30, 60, 90, 120].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.slotDurationChip,
                facilityData.slotDuration === duration && styles.slotDurationChipActive,
              ]}
              onPress={() => updateField('slotDuration', duration)}
            >
              <Text style={[
                styles.slotDurationText,
                facilityData.slotDuration === duration && styles.slotDurationTextActive,
              ]}>
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Photos</Text>
      <Text style={styles.stepSubtitle}>Add photos of your facility (up to 10)</Text>

      <TouchableOpacity style={styles.addPhotoButton} onPress={pickImages}>
        <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
        <Text style={styles.addPhotoText}>Add Photos</Text>
        <Text style={styles.addPhotoSubtext}>{facilityData.images.length}/10 photos</Text>
      </TouchableOpacity>

      {facilityData.images.length > 0 && (
        <View style={styles.imagesGrid}>
          {facilityData.images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color={COLORS.white} />
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>Cover</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Amenities</Text>
      <Text style={styles.stepSubtitle}>Select available amenities</Text>

      <View style={styles.amenitiesGrid}>
        {AMENITIES_OPTIONS.map((amenity) => (
          <TouchableOpacity
            key={amenity.name}
            style={[
              styles.amenityCard,
              facilityData.amenities.includes(amenity.name) && styles.amenityCardSelected,
            ]}
            onPress={() => toggleAmenity(amenity.name)}
          >
            <Ionicons
              name={amenity.icon}
              size={24}
              color={facilityData.amenities.includes(amenity.name) ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[
              styles.amenityName,
              facilityData.amenities.includes(amenity.name) && styles.amenityNameSelected,
            ]}>
              {amenity.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Facility</Text>
        <Text style={styles.stepCount}>{currentStep}/{STEPS.length}</Text>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView 
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 1 && { flex: 1 }]}
          onPress={nextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === STEPS.length ? 'Create Facility' : 'Continue'}
              </Text>
              {currentStep < STEPS.length && (
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  stepCount: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCurrent: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  stepNumber: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  stepContent: {
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  locationButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  coordinatesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  coordinatesText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  sportCard: {
    width: (width - SPACING.lg * 2 - SPACING.xs * 6) / 3,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  sportCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  sportEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  sportName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  sportNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sportCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencySymbol: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  priceInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  perHourText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  sportPricingSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  sportPricingTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sportPricingSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sportPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sportPriceLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sportPriceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencySmall: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sportPriceInput: {
    width: 80,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  slotDurationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  slotDurationChip: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotDurationChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotDurationText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  slotDurationTextActive: {
    color: COLORS.white,
  },
  addPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: SPACING.lg,
  },
  addPhotoText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  addPhotoSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  imageContainer: {
    width: (width - SPACING.lg * 2 - SPACING.xs * 6) / 3,
    aspectRatio: 1,
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  coverBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  amenityCard: {
    width: (width - SPACING.lg * 2 - SPACING.xs * 6) / 3,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  amenityCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  amenityName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  amenityNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  nextButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: SPACING.xs,
  },
});

export default OwnerOnboardingScreen;
