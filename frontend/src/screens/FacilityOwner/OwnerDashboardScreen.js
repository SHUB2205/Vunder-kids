import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const { width } = Dimensions.get('window');

const OwnerDashboardScreen = ({ navigation }) => {
  const [ownerData, setOwnerData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekBookings: 0,
    monthRevenue: 0,
    pendingBookings: 0,
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOwnerData();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilityData();
    }
  }, [selectedFacility]);

  const loadOwnerData = async () => {
    try {
      const data = await AsyncStorage.getItem('ownerData');
      if (data) {
        const parsed = JSON.parse(data);
        setOwnerData(parsed);
        fetchFacilities();
      }
    } catch (error) {
      console.error('Load owner data error:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const res = await api.get(API_ENDPOINTS.GET_MY_FACILITIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const fetchFacilityData = async () => {
    if (!selectedFacility) return;
    
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's bookings
      const bookingsRes = await api.get(
        API_ENDPOINTS.GET_FACILITY_BOOKINGS(selectedFacility._id),
        {
          params: { date: today },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const bookings = bookingsRes.data.bookings || [];
      setTodayBookings(bookings);

      // Fetch accurate analytics (revenue, week/month totals)
      try {
        const analyticsRes = await api.get(
          API_ENDPOINTS.GET_FACILITY_ANALYTICS(selectedFacility._id),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const a = analyticsRes.data.analytics || {};
        setStats({
          todayBookings: a.todayBookings ?? bookings.filter(b => b.status !== 'cancelled').length,
          weekBookings: a.weekBookings ?? 0,
          monthRevenue: a.monthPaidRevenue ?? a.monthRevenue ?? 0,
          pendingBookings: a.pendingBookings ?? bookings.filter(b => b.status === 'pending').length,
        });
      } catch (analyticsErr) {
        // Fallback to today's bookings if analytics unavailable
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        const revenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        setStats({
          todayBookings: confirmedBookings.length,
          weekBookings: confirmedBookings.length,
          monthRevenue: revenue,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
        });
      }
    } catch (error) {
      console.error('Fetch facility data error:', error);
    }
  };

  const toggleFacilityActive = async () => {
    if (!selectedFacility) return;
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const newActive = !selectedFacility.isActive;
      await api.put(
        API_ENDPOINTS.UPDATE_FACILITY(selectedFacility._id),
        { isActive: newActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = { ...selectedFacility, isActive: newActive };
      setSelectedFacility(updated);
      setFacilities((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update facility');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFacilities();
    if (selectedFacility) {
      await fetchFacilityData();
    }
    setRefreshing(false);
  }, [selectedFacility]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('ownerToken');
          await AsyncStorage.removeItem('ownerData');
          navigation.replace('OwnerLogin');
        }
      }
    ]);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (facilities.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Facilities Yet</Text>
          <Text style={styles.emptySubtitle}>Add your first facility to start receiving bookings</Text>
          <TouchableOpacity
            style={styles.addFacilityButton}
            onPress={() => navigation.navigate('OwnerOnboarding')}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addFacilityButtonText}>Add Facility</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.ownerName}>{ownerData?.name || 'Owner'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('OwnerNotifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Facility Selector */}
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
                source={{ uri: facility.image || facility.images?.[0] || 'https://via.placeholder.com/40' }}
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
            onPress={() => navigation.navigate('OwnerOnboarding')}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </ScrollView>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="calendar" size={28} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.todayBookings}</Text>
              <Text style={styles.statLabel}>Today's Bookings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="cash" size={28} color={COLORS.success} />
              <Text style={styles.statValue}>₹{(stats.monthRevenue / 1000).toFixed(1)}k</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="trending-up" size={28} color={COLORS.info} />
              <Text style={styles.statValue}>{stats.weekBookings}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="time" size={28} color={COLORS.warning} />
              <Text style={styles.statValue}>{stats.pendingBookings}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageSchedule', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagePricing', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="pricetag-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Pricing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManagePhotos', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="images-outline" size={24} color={COLORS.info} />
              </View>
              <Text style={styles.actionText}>Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('EditFacility', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="create-outline" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.actionText}>Edit Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AllBookings', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="list-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerCustomers', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '25' }]}>
                <Ionicons name="people-outline" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionText}>Customers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('OwnerPayments', { facilityId: selectedFacility?._id })}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="wallet-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllBookings', { facilityId: selectedFacility?._id })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayBookings.length === 0 ? (
            <View style={styles.noBookingsCard}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.noBookingsText}>No bookings for today</Text>
            </View>
          ) : (
            todayBookings.slice(0, 5).map((booking) => (
              <TouchableOpacity
                key={booking._id}
                style={styles.bookingCard}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: booking._id, booking, facilityId: selectedFacility?._id })}
              >
                <View style={styles.bookingTime}>
                  <Text style={styles.timeText}>{booking.startTime}</Text>
                  <View style={styles.timeLine} />
                  <Text style={styles.timeText}>{booking.endTime}</Text>
                </View>
                <View style={styles.bookingInfo}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.userInfo}>
                      <Image
                        source={{ uri: booking.user?.avatar || 'https://via.placeholder.com/36' }}
                        style={styles.userAvatar}
                      />
                      <View>
                        <Text style={styles.userName}>{booking.user?.name || 'User'}</Text>
                        <Text style={styles.userPhone}>{booking.user?.phone || booking.sport}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Text style={styles.bookingAmount}>₹{booking.totalAmount}</Text>
                    <Text style={styles.bookingCode}>#{booking.bookingCode}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Facility Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facility Status</Text>
          <View style={styles.facilityStatusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: selectedFacility?.isActive ? COLORS.success : COLORS.error }]} />
                <Text style={styles.statusLabel}>
                  {selectedFacility?.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleFacilityActive}
              >
                <Text style={styles.toggleButtonText}>
                  {selectedFacility?.isActive ? 'Pause Bookings' : 'Resume Bookings'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {selectedFacility?.rating?.toFixed(1) || '0.0'} ({selectedFacility?.reviews?.length || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  greeting: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  ownerName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
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
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
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
  viewAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  actionCard: {
    width: (width - SPACING.lg * 2 - SPACING.xs * 6) / 4,
    alignItems: 'center',
    margin: SPACING.xs,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  actionText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  noBookingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  noBookingsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
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
    height: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingAmount: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bookingCode: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  facilityStatusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  toggleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  toggleButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
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
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  addFacilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl,
  },
  addFacilityButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default OwnerDashboardScreen;
