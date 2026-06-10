import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const FacilityOwnerDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, revenue: 0 });

  useEffect(() => {
    fetchMyFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilityBookings();
    }
  }, [selectedFacility, selectedDate]);

  const fetchMyFacilities = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_MY_FACILITIES);
      const facs = res.data.facilities || [];
      setFacilities(facs);
      if (facs.length > 0 && !selectedFacility) {
        setSelectedFacility(facs[0]);
      }
    } catch (error) {
      console.error('Fetch facilities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilityBookings = async () => {
    if (!selectedFacility) return;
    
    setBookingsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get(API_ENDPOINTS.GET_FACILITY_BOOKINGS(selectedFacility._id), {
        params: { date: dateStr }
      });
      setBookings(res.data.bookings || []);
      
      // Calculate stats
      const todayBookings = res.data.bookings?.length || 0;
      const revenue = res.data.bookings?.reduce((sum, b) => sum + (b.totalAmount || 0), 0) || 0;
      setStats(prev => ({ ...prev, today: todayBookings, revenue }));
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyFacilities();
    if (selectedFacility) {
      await fetchFacilityBookings();
    }
    setRefreshing(false);
  }, [selectedFacility, selectedDate]);

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'completed': return COLORS.info;
      case 'cancelled': return COLORS.error;
      case 'pending': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const renderFacilitySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.facilitySelectorContainer}
    >
      {facilities.map((facility) => (
        <TouchableOpacity
          key={facility._id}
          style={[
            styles.facilityChip,
            selectedFacility?._id === facility._id && styles.facilityChipActive
          ]}
          onPress={() => setSelectedFacility(facility)}
        >
          <Image
            source={{ uri: facility.image || 'https://via.placeholder.com/40' }}
            style={styles.facilityChipImage}
          />
          <Text style={[
            styles.facilityChipText,
            selectedFacility?._id === facility._id && styles.facilityChipTextActive
          ]} numberOfLines={1}>
            {facility.name}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.addFacilityChip}
        onPress={() => navigation.navigate('AddFacility')}
      >
        <Ionicons name="add" size={20} color={COLORS.primary} />
        <Text style={styles.addFacilityText}>Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDateSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dateSelectorContainer}
    >
      {getWeekDates().map((date) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        
        return (
          <TouchableOpacity
            key={date.toISOString()}
            style={[styles.dateItem, isSelected && styles.dateItemSelected]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
              {date.toLocaleDateString('en', { weekday: 'short' })}
            </Text>
            <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
              {date.getDate()}
            </Text>
            {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingTime}>
        <Text style={styles.timeText}>{item.startTime}</Text>
        <View style={styles.timeLine} />
        <Text style={styles.timeText}>{item.endTime}</Text>
      </View>
      <View style={styles.bookingInfo}>
        <View style={styles.bookingHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: item.user?.avatar || 'https://via.placeholder.com/36' }}
              style={styles.userAvatar}
            />
            <View>
              <Text style={styles.userName}>{item.user?.name || 'User'}</Text>
              <Text style={styles.userPhone}>{item.user?.phone || item.user?.userName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.bookingMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="basketball-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.sport}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>₹{item.totalAmount}</Text>
          </View>
          <Text style={styles.bookingCode}>#{item.bookingCode}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (facilities.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Facility Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Facilities Yet</Text>
          <Text style={styles.emptySubtitle}>Add your first facility to start managing bookings</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFacility')}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Facility</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facility Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Facility Selector */}
        {renderFacilitySelector()}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{stats.today}</Text>
            <Text style={styles.statLabel}>Today's Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>₹{stats.revenue}</Text>
            <Text style={styles.statLabel}>Today's Revenue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditFacility', { facilityId: selectedFacility?._id })}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Edit Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageSchedule', { facilityId: selectedFacility?._id })}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FacilityAnalytics', { facilityId: selectedFacility?._id })}
          >
            <Ionicons name="stats-chart-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bookings</Text>
        </View>
        {renderDateSelector()}

        {/* Bookings List */}
        {bookingsLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
        ) : bookings.length > 0 ? (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => (
              <View key={booking._id}>
                {renderBookingItem({ item: booking })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noBookingsContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.noBookingsText}>No bookings for this date</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  facilitySelectorContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facilityChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  facilityChipImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: SPACING.sm,
  },
  facilityChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    maxWidth: 100,
  },
  facilityChipTextActive: {
    color: COLORS.white,
  },
  addFacilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addFacilityText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  actionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateSelectorContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    minWidth: 55,
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
  todayDotSelected: {
    backgroundColor: COLORS.white,
  },
  bookingsList: {
    paddingHorizontal: SPACING.lg,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  bookingTime: {
    width: 60,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  timeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.primary,
    marginVertical: 4,
  },
  bookingInfo: {
    flex: 1,
    padding: SPACING.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  bookingCode: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginLeft: 'auto',
  },
  noBookingsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  noBookingsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xl,
  },
  addButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default FacilityOwnerDashboard;
