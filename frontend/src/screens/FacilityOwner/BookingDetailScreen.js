import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { getOwnerAuthConfig } from '../../utils/ownerAuth';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
const PAYMENT_OPTIONS = ['pending', 'paid', 'partial', 'refunded'];

const statusColor = (status) => {
  switch (status) {
    case 'confirmed': return COLORS.success;
    case 'completed': return COLORS.info;
    case 'cancelled': return COLORS.error;
    case 'no-show': return COLORS.error;
    case 'pending': return COLORS.warning;
    case 'paid': return COLORS.success;
    case 'refunded': return COLORS.info;
    case 'partial': return COLORS.warning;
    default: return COLORS.textSecondary;
  }
};

const BookingDetailScreen = ({ navigation, route }) => {
  const [booking, setBooking] = useState(route.params?.booking || null);
  const [saving, setSaving] = useState(false);

  const update = async (payload) => {
    if (!booking?._id) return;
    setSaving(true);
    try {
      const config = await getOwnerAuthConfig();
      const res = await api.put(API_ENDPOINTS.UPDATE_OWNER_BOOKING(booking._id), payload, config);
      setBooking(res.data.booking);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Booking not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking code & amount */}
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.codeLabel}>Booking Code</Text>
              <Text style={styles.code}>#{booking.bookingCode || booking._id?.slice(-6)}</Text>
            </View>
            <Text style={styles.amount}>₹{booking.totalAmount}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: statusColor(booking.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor(booking.status) }]}>{booking.status}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor(booking.paymentStatus) + '20' }]}>
              <Ionicons name="card-outline" size={12} color={statusColor(booking.paymentStatus)} />
              <Text style={[styles.badgeText, { color: statusColor(booking.paymentStatus), marginLeft: 4 }]}>
                {booking.paymentStatus || 'pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerRow}>
            <Image source={{ uri: booking.user?.avatar || 'https://via.placeholder.com/48' }} style={styles.customerAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{booking.user?.name || 'User'}</Text>
              {booking.user?.email ? <Text style={styles.customerSub}>{booking.user.email}</Text> : null}
            </View>
            {booking.user?.phone ? (
              <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${booking.user.phone}`)}>
                <Ionicons name="call" size={18} color={COLORS.white} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow icon="basketball-outline" label="Sport" value={booking.sport} />
          <DetailRow icon="calendar-outline" label="Date" value={formatDate(booking.date)} />
          <DetailRow icon="time-outline" label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
          {booking.slots?.length ? <DetailRow icon="grid-outline" label="Slots" value={booking.slots.join(', ')} /> : null}
          {booking.notes ? <DetailRow icon="document-text-outline" label="Customer Notes" value={booking.notes} /> : null}
        </View>

        {/* Manage status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.optionWrap}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.option, booking.status === s && { backgroundColor: statusColor(s), borderColor: statusColor(s) }]}
                onPress={() => update({ status: s })}
                disabled={saving}
              >
                <Text style={[styles.optionText, booking.status === s && { color: COLORS.white }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Manage payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.optionWrap}>
            {PAYMENT_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.option, booking.paymentStatus === p && { backgroundColor: statusColor(p), borderColor: statusColor(p) }]}
                onPress={() => update({ paymentStatus: p })}
                disabled={saving}
              >
                <Text style={[styles.optionText, booking.paymentStatus === p && { color: COLORS.white }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {saving && (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
  content: { padding: SPACING.lg },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  code: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  amount: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.primary },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  badgeText: { fontSize: FONTS.sizes.sm, fontWeight: '700', textTransform: 'capitalize' },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  customerRow: { flexDirection: 'row', alignItems: 'center' },
  customerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.md, backgroundColor: COLORS.surface },
  customerName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  customerSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  callBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success,
    justifyContent: 'center', alignItems: 'center',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  detailLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginLeft: SPACING.sm, width: 110 },
  detailValue: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '500', textAlign: 'right' },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  option: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize' },
  savingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  savingText: { marginLeft: SPACING.sm, color: COLORS.textSecondary },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginBottom: SPACING.md },
  linkText: { color: COLORS.primary, fontWeight: '600' },
});

export default BookingDetailScreen;
