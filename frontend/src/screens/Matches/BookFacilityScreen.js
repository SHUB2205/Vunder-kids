import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const BookFacilityScreen = ({ navigation, route }) => {
  const { facilityId, matchDate, sportName } = route.params;
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date(matchDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchFacilityDetails();
  }, []);

  const fetchFacilityDetails = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_FACILITY}/${facilityId}`);
      setFacility(response.data.facility);
      // Generate mock available slots (in real app, this would come from backend)
      generateAvailableSlots();
    } catch (error) {
      console.error('Error fetching facility:', error);
      Alert.alert('Error', 'Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableSlots = () => {
    // Mock time slots - in real app, fetch from backend based on facility availability
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      slots.push({
        id: `${hour}:00-${hour + 1}:00`,
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // 70% availability
        price: Math.floor(Math.random() * 50) + 20, // $20-$70
      });
    }
    setAvailableSlots(slots);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      generateAvailableSlots(); // Regenerate slots for new date
    }
  };

  const toggleSlot = (slotId) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slotId) => {
      const slot = availableSlots.find(s => s.id === slotId);
      return total + (slot?.price || 0);
    }, 0);
  };

  const handleBookFacility = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Error', 'Please select at least one time slot');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.BOOK_FACILITY, {
        facilityId,
        date: selectedDate.toISOString(),
        slots: selectedSlots,
        totalAmount: calculateTotal(),
      });

      Alert.alert(
        'Booking Confirmed!',
        `Your booking at ${facility.name} has been confirmed for ${selectedSlots.length} slot(s).`,
        [
          { text: 'View Directions', onPress: openGoogleMaps },
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to book facility');
    } finally {
      setBookingLoading(false);
      setShowBookingModal(false);
    }
  };

  const openGoogleMaps = () => {
    if (!facility?.location) return;
    
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.location)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

  const openGoogleMapsDirections = () => {
    if (!facility?.location) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.location)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        !item.available && styles.timeSlotDisabled,
        selectedSlots.includes(item.id) && styles.timeSlotSelected,
      ]}
      onPress={() => item.available && toggleSlot(item.id)}
      disabled={!item.available}
    >
      <View style={styles.timeSlotLeft}>
        <Text style={[
          styles.timeSlotTime,
          !item.available && styles.timeSlotTextDisabled,
          selectedSlots.includes(item.id) && styles.timeSlotTextSelected,
        ]}>
          {item.time}
        </Text>
        <Text style={[
          styles.timeSlotPrice,
          !item.available && styles.timeSlotTextDisabled,
        ]}>
          ${item.price}
        </Text>
      </View>
      <View style={styles.timeSlotRight}>
        {!item.available ? (
          <Text style={styles.timeSlotStatusUnavailable}>Unavailable</Text>
        ) : selectedSlots.includes(item.id) ? (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        ) : (
          <Ionicons name="radio-button-off" size={24} color={COLORS.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading facility details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Facility</Text>
        <TouchableOpacity onPress={openGoogleMapsDirections}>
          <Ionicons name="navigate" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Facility Info */}
        <View style={styles.facilityCard}>
          <Text style={styles.facilityName}>{facility.name}</Text>
          <Text style={styles.facilityLocation}>{facility.location}</Text>
          <View style={styles.facilityMeta}>
            <View style={styles.facilityRating}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.facilityRatingText}>{facility.rating || 'N/A'}</Text>
            </View>
            <Text style={styles.facilitySports}>
              {facility.sports?.join(', ') || sportName}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.mapsButton} onPress={openGoogleMaps}>
            <Ionicons name="map" size={20} color={COLORS.primary} />
            <Text style={styles.mapsButtonText}>View on Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <FlatList
            data={availableSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.timeSlotsList}
          />
        </View>

        {/* Booking Summary */}
        {selectedSlots.length > 0 && (
          <View style={styles.bookingSummary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Slots:</Text>
              <Text style={styles.summaryValue}>{selectedSlots.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>${calculateTotal()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            selectedSlots.length === 0 && styles.bookButtonDisabled,
          ]}
          onPress={() => setShowBookingModal(true)}
          disabled={selectedSlots.length === 0 || bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.bookButtonText}>
              Book {selectedSlots.length} Slot{selectedSlots.length !== 1 ? 's' : ''} - ${calculateTotal()}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Booking</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.confirmationDetails}>
              <Text style={styles.confirmationFacility}>{facility.name}</Text>
              <Text style={styles.confirmationDate}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </Text>
              <Text style={styles.confirmationSlots}>
                {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
              </Text>
              <Text style={styles.confirmationTotal}>Total: ${calculateTotal()}</Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleBookFacility}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
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
  facilityCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  facilityName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  facilityLocation: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  facilityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  facilityRatingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  facilitySports: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  mapsButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  timeSlotsList: {
    gap: SPACING.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeSlotDisabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  timeSlotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  timeSlotLeft: {
    flex: 1,
  },
  timeSlotTime: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeSlotTextDisabled: {
    color: COLORS.textLight,
  },
  timeSlotTextSelected: {
    color: COLORS.primary,
  },
  timeSlotPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeSlotRight: {
    alignItems: 'center',
  },
  timeSlotStatusUnavailable: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  bookingSummary: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.6,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    margin: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmationDetails: {
    marginBottom: SPACING.lg,
  },
  confirmationFacility: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  confirmationDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  confirmationSlots: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  confirmationTotal: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default BookFacilityScreen;
