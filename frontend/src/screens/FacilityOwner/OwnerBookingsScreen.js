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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { getOwnerAuthConfig } from '../../utils/ownerAuth';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusColor = (status) => {
  switch (status) {
    case 'confirmed': return COLORS.success;
    case 'completed': return COLORS.info;
    case 'cancelled': return COLORS.error;
    case 'no-show': return COLORS.error;
    case 'pending': return COLORS.warning;
    default: return COLORS.textSecondary;
  }
};

const paymentColor = (p) => {
  switch (p) {
    case 'paid': return COLORS.success;
    case 'refunded': return COLORS.info;
    case 'partial': return COLORS.warning;
    default: return COLORS.textSecondary;
  }
};

const OwnerBookingsScreen = ({ navigation, route }) => {
  const facilityId = route.params?.facilityId;
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!facilityId) { setLoading(false); return; }
    try {
      const config = await getOwnerAuthConfig({
        params: filter === 'all' ? {} : { status: filter },
      });
      const res = await api.get(API_ENDPOINTS.GET_FACILITY_BOOKINGS(facilityId), config);
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error('Fetch bookings error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [facilityId, filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id, facilityId })}
    >
      <View style={styles.cardLeft}>
        <Image
          source={{ uri: item.user?.avatar || 'https://via.placeholder.com/44' }}
          style={styles.avatar}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.userName} numberOfLines={1}>{item.user?.name || 'User'}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.metaText}>
          {item.sport} · {formatDate(item.date)}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>₹{item.totalAmount}</Text>
            <View style={[styles.payBadge, { backgroundColor: paymentColor(item.paymentStatus) + '20' }]}>
              <Text style={[styles.payText, { color: paymentColor(item.paymentStatus) }]}>
                {item.paymentStatus || 'pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No {filter === 'all' ? '' : filter} bookings</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  filterWrap: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white },
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: { marginRight: SPACING.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface },
  cardBody: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginVertical: 4 },
  timeText: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '500' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  amount: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginRight: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'capitalize' },
  payBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  payText: { fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { marginTop: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
});

export default OwnerBookingsScreen;
