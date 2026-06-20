import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { getOwnerAuthConfig } from '../../utils/ownerAuth';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const OwnerPaymentsScreen = ({ navigation, route }) => {
  const facilityId = route.params?.facilityId;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!facilityId) { setLoading(false); return; }
    try {
      const config = await getOwnerAuthConfig();
      const res = await api.get(API_ENDPOINTS.GET_FACILITY_ANALYTICS(facilityId), config);
      setAnalytics(res.data.analytics);
    } catch (error) {
      console.error('Fetch analytics error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [facilityId]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const onRefresh = () => { setRefreshing(true); fetchAnalytics(); };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  const a = analytics || {};
  const pb = a.paymentBreakdown || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & Revenue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Headline revenue */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Revenue (collected)</Text>
          <Text style={styles.heroValue}>{money(a.paidRevenue)}</Text>
          <View style={styles.heroSubRow}>
            <Ionicons name="hourglass-outline" size={14} color={COLORS.white} />
            <Text style={styles.heroSub}>{money(a.pendingRevenue)} pending collection</Text>
          </View>
        </View>

        {/* Revenue cards */}
        <View style={styles.grid}>
          <StatCard icon="cash" color={COLORS.success} value={money(a.totalRevenue)} label="Total Booked Value" />
          <StatCard icon="calendar" color={COLORS.primary} value={money(a.monthRevenue)} label="This Month" />
          <StatCard icon="checkmark-done" color={COLORS.info} value={money(a.monthPaidRevenue)} label="Collected (Month)" />
          <StatCard icon="receipt-outline" color={COLORS.warning} value={`${a.totalBookings || 0}`} label="Total Bookings" />
        </View>

        {/* Payment status breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Status</Text>
          <BreakdownRow label="Paid" count={pb.paid} color={COLORS.success} icon="checkmark-circle" />
          <BreakdownRow label="Pending" count={pb.pending} color={COLORS.warning} icon="time" />
          <BreakdownRow label="Partial" count={pb.partial} color={COLORS.info} icon="pie-chart" />
          <BreakdownRow label="Refunded" count={pb.refunded} color={COLORS.textSecondary} icon="arrow-undo" />
        </View>

        {/* Booking status overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Overview</Text>
          <BreakdownRow label="Pending Approval" count={a.pendingBookings} color={COLORS.warning} icon="hourglass" />
          <BreakdownRow label="Cancelled" count={a.cancelledBookings} color={COLORS.error} icon="close-circle" />
          <BreakdownRow label="This Week" count={a.weekBookings} color={COLORS.primary} icon="trending-up" />
        </View>

        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => navigation.navigate('AllBookings', { facilityId })}
        >
          <Ionicons name="list-outline" size={18} color={COLORS.white} />
          <Text style={styles.manageBtnText}>Manage Bookings & Collect Payments</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ icon, color, value, label }) => (
  <View style={[styles.statCard, { backgroundColor: color + '15' }]}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BreakdownRow = ({ label, count, color, icon }) => (
  <View style={styles.breakdownRow}>
    <View style={[styles.breakdownIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.breakdownLabel}>{label}</Text>
    <Text style={[styles.breakdownCount, { color }]}>{count || 0}</Text>
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
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  heroLabel: { fontSize: FONTS.sizes.sm, color: COLORS.white, opacity: 0.9 },
  heroValue: { fontSize: 36, fontWeight: 'bold', color: COLORS.white, marginVertical: SPACING.xs },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  heroSub: { fontSize: FONTS.sizes.sm, color: COLORS.white, marginLeft: SPACING.xs, opacity: 0.95 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  statCard: {
    width: '47%',
    flexGrow: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.sm },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  breakdownIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  breakdownLabel: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  breakdownCount: { fontSize: FONTS.sizes.lg, fontWeight: '700' },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  manageBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md, marginLeft: SPACING.sm },
});

export default OwnerPaymentsScreen;
