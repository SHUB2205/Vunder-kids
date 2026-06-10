import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AMENITY_ICONS = {
  'Parking': 'car',
  'Changing Room': 'shirt',
  'Showers': 'water',
  'Cafeteria': 'cafe',
  'First Aid': 'medkit',
  'WiFi': 'wifi',
  'Floodlights': 'bulb',
  'Equipment Rental': 'basketball',
  'Lockers': 'lock-closed',
  'Seating': 'people',
};

const FacilityDetailScreen = ({ route, navigation }) => {
  const { facilityId } = route.params;
  const { user } = useAuth();
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    fetchFacility();
  }, [facilityId]);

  useEffect(() => {
    if (facility) {
      fetchAvailability();
    }
  }, [selectedDate, facility]);

  const fetchFacility = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_FACILITY(facilityId));
      setFacility(res.data.facility);
      if (res.data.facility.sports?.length > 0) {
        setSelectedSport(res.data.facility.sports[0]);
      }
    } catch (error) {
      console.error('Fetch facility error:', error);
      Alert.alert('Error', 'Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setSlotsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get(API_ENDPOINTS.GET_FACILITY_AVAILABILITY(facilityId), {
        params: { date: dateStr }
      });
      setSlots(res.data.slots || []);
    } catch (error) {
      console.error('Fetch availability error:', error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const toggleSlot = (slot) => {
    if (!slot.available) return;
    
    const isSelected = selectedSlots.includes(slot.time);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot.time));
    } else {
      // Ensure consecutive slots
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot.time]);
      } else {
        const sortedSlots = [...selectedSlots, slot.time].sort();
        // Check if slots are consecutive
        let isConsecutive = true;
        for (let i = 1; i < sortedSlots.length; i++) {
          const prev = parseInt(sortedSlots[i-1].split(':')[0]);
          const curr = parseInt(sortedSlots[i].split(':')[0]);
          if (curr - prev !== 1) {
            isConsecutive = false;
            break;
          }
        }
        if (isConsecutive) {
          setSelectedSlots(sortedSlots);
        } else {
          Alert.alert('Invalid Selection', 'Please select consecutive time slots');
        }
      }
    }
  };

  const calculateTotal = () => {
    return selectedSlots.length * (facility?.pricePerHour || 0);
  };

  const getEndTime = () => {
    if (selectedSlots.length === 0) return '';
    const lastSlot = selectedSlots[selectedSlots.length - 1];
    const [hours] = lastSlot.split(':').map(Number);
    return `${(hours + 1).toString().padStart(2, '0')}:00`;
  };

  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Select Slots', 'Please select at least one time slot');
      return;
    }
    if (!selectedSport) {
      Alert.alert('Select Sport', 'Please select a sport for your booking');
      return;
    }

    setBooking(true);
    try {
      const res = await api.post(API_ENDPOINTS.BOOK_FACILITY, {
        facilityId,
        date: selectedDate.toISOString(),
        startTime: selectedSlots[0],
        endTime: getEndTime(),
        slots: selectedSlots,
        sport: selectedSport,
        totalAmount: calculateTotal(),
      });

      setShowBookingModal(false);
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ${selectedSport} session at ${facility.name} is booked.\n\nBooking Code: ${res.data.booking.bookingCode}`,
        [
          {
            text: 'View Match',
            onPress: () => navigation.navigate('MatchDetail', { matchId: res.data.match._id })
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
      
      // Reset selection
      setSelectedSlots([]);
      fetchAvailability();
    } catch (error) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setBooking(false);
    }
  };

  const renderDateItem = ({ item }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();
    const isToday = item.toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.dateItemSelected]}
        onPress={() => { setSelectedDate(item); setSelectedSlots([]); }}
      >
        <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
          {item.toLocaleDateString('en', { weekday: 'short' })}
        </Text>
        <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
          {item.getDate()}
        </Text>
        {isToday && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  const renderSlot = ({ item }) => {
    const isSelected = selectedSlots.includes(item.time);
    const isPast = selectedDate.toDateString() === new Date().toDateString() && 
      parseInt(item.time.split(':')[0]) <= new Date().getHours();
    
    return (
      <TouchableOpacity
        style={[
          styles.slotItem,
          !item.available && styles.slotUnavailable,
          isSelected && styles.slotSelected,
          isPast && styles.slotPast,
        ]}
        onPress={() => !isPast && toggleSlot(item)}
        disabled={!item.available || isPast}
      >
        <Text style={[
          styles.slotTime,
          !item.available && styles.slotTimeUnavailable,
          isSelected && styles.slotTimeSelected,
        ]}>
          {item.time}
        </Text>
        <Text style={[
          styles.slotPrice,
          !item.available && styles.slotPriceUnavailable,
          isSelected && styles.slotPriceSelected,
        ]}>
          {item.available ? `₹${item.price}` : 'Booked'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!facility) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.errorText}>Facility not found</Text>
      </View>
    );
  }

  const allImages = [facility.image, ...(facility.images || [])].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => setShowGallery(true)}>
            <Image
              source={{ uri: facility.image || 'https://via.placeholder.com/400x250' }}
              style={styles.headerImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
          {allImages.length > 1 && (
            <TouchableOpacity style={styles.galleryButton} onPress={() => setShowGallery(true)}>
              <Ionicons name="images" size={16} color={COLORS.white} />
              <Text style={styles.galleryCount}>{allImages.length}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Facility Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.facilityName}>{facility.name}</Text>
              {facility.isVerified && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{facility.rating?.toFixed(1) || '4.5'}</Text>
              <Text style={styles.reviewCount}>({facility.totalReviews || 0})</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{facility.address || facility.location}</Text>
          </View>

          {/* Sports */}
          <View style={styles.sportsSection}>
            <Text style={styles.sectionLabel}>Available Sports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {facility.sports?.map((sport, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.sportChip,
                    selectedSport === sport && styles.sportChipSelected
                  ]}
                  onPress={() => setSelectedSport(sport)}
                >
                  <Text style={styles.sportEmoji}>{getSportEmoji(sport)}</Text>
                  <Text style={[
                    styles.sportName,
                    selectedSport === sport && styles.sportNameSelected
                  ]}>{sport}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price per hour</Text>
              <Text style={styles.priceValue}>₹{facility.pricePerHour}</Text>
            </View>
            <View style={styles.timingBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.timingText}>
                {facility.openingHours?.open || '06:00'} - {facility.openingHours?.close || '22:00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        {facility.amenities?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {facility.amenities.map((amenity, idx) => (
                <View key={idx} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <Ionicons 
                      name={AMENITY_ICONS[amenity] || 'checkmark'} 
                      size={18} 
                      color={COLORS.primary} 
                    />
                  </View>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {facility.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{facility.description}</Text>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <FlatList
            horizontal
            data={getWeekDates()}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.toISOString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          />
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Slots - {selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          {slotsLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
          ) : slots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {slots.map((slot, idx) => (
                <View key={idx} style={{ width: '23%', marginBottom: SPACING.sm }}>
                  {renderSlot({ item: slot })}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noSlotsText}>No slots available for this date</Text>
          )}
        </View>

        {/* Reviews Preview */}
        {facility.reviews?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {facility.reviews.slice(0, 2).map((review, idx) => (
              <View key={idx} style={styles.reviewItem}>
                <Image
                  source={{ uri: review.user?.avatar || 'https://via.placeholder.com/40' }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewContent}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.user?.name || 'User'}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#FFB800"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          {selectedSlots.length > 0 ? (
            <>
              <Text style={styles.selectedInfo}>
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} • {selectedSlots[0]} - {getEndTime()}
              </Text>
              <Text style={styles.totalPrice}>₹{calculateTotal()}</Text>
            </>
          ) : (
            <Text style={styles.selectPrompt}>Select time slots to book</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.bookNowButton, selectedSlots.length === 0 && styles.bookNowButtonDisabled]}
          onPress={() => setShowBookingModal(true)}
          disabled={selectedSlots.length === 0}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Confirmation Modal */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bookingModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            
            <View style={styles.bookingSummary}>
              <Image source={{ uri: facility.image }} style={styles.summaryImage} />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryName}>{facility.name}</Text>
                <Text style={styles.summarySport}>{getSportEmoji(selectedSport)} {selectedSport}</Text>
              </View>
            </View>

            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={18} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={18} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {selectedSlots[0]} - {getEndTime()} ({selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={18} color={COLORS.textSecondary} />
                <Text style={styles.detailText} numberOfLines={1}>{facility.address}</Text>
              </View>
            </View>

            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceRowLabel}>₹{facility.pricePerHour} × {selectedSlots.length} hour(s)</Text>
                <Text style={styles.priceRowValue}>₹{calculateTotal()}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
              </View>
            </View>

            <Text style={styles.matchNote}>
              💡 A match will be automatically created for this booking
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleBooking}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                )}
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
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: SCREEN_WIDTH,
    height: 250,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  galleryCount: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    marginLeft: 4,
  },
  infoSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facilityName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  sportsSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  sportChipSelected: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  sportEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  sportName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  sportNameSelected: {
    color: COLORS.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  timingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: SPACING.md,
  },
  amenityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  amenityText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  dateList: {
    paddingVertical: SPACING.xs,
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    minWidth: 60,
  },
  dateItemSelected: {
    backgroundColor: COLORS.primary,
  },
  dateDay: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateDaySelected: {
    color: COLORS.white,
  },
  dateNum: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateNumSelected: {
    color: COLORS.white,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotItem: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotUnavailable: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
  },
  slotPast: {
    opacity: 0.5,
  },
  slotTime: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  slotTimeSelected: {
    color: COLORS.white,
  },
  slotTimeUnavailable: {
    color: COLORS.textLight,
  },
  slotPrice: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slotPriceSelected: {
    color: COLORS.white,
  },
  slotPriceUnavailable: {
    color: COLORS.textLight,
  },
  noSlotsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: SPACING.lg,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reviewerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  bottomLeft: {
    flex: 1,
  },
  selectedInfo: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  totalPrice: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  selectPrompt: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  bookNowButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  bookNowText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bookingModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  bookingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  summarySport: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bookingDetails: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  priceBreakdown: {
    marginBottom: SPACING.lg,
  },
  priceRowLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  priceRowValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  matchNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.info + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default FacilityDetailScreen;
