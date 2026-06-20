import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { getOwnerAuthConfig } from '../../utils/ownerAuth';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const OwnerCustomersScreen = ({ navigation, route }) => {
  const facilityId = route.params?.facilityId;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!facilityId) { setLoading(false); return; }
    try {
      const config = await getOwnerAuthConfig();
      const res = await api.get(API_ENDPOINTS.GET_FACILITY_CUSTOMERS(facilityId), config);
      setCustomers(res.data.customers || []);
    } catch (error) {
      console.error('Fetch customers error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [facilityId]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const onRefresh = () => { setRefreshing(true); fetchCustomers(); };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); }
    catch { return ''; }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.user?.avatar || 'https://via.placeholder.com/48' }} style={styles.avatar} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.user?.name || 'User'}</Text>
        <Text style={styles.meta}>
          {item.totalBookings} booking{item.totalBookings === 1 ? '' : 's'} · Last {formatDate(item.lastBooking)}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="cash-outline" size={12} color={COLORS.success} />
            <Text style={styles.statText}>₹{item.totalSpent}</Text>
          </View>
          {item.completedBookings > 0 && (
            <View style={styles.statPill}>
              <Ionicons name="checkmark-circle-outline" size={12} color={COLORS.info} />
              <Text style={styles.statText}>{item.completedBookings} done</Text>
            </View>
          )}
        </View>
      </View>
      {item.user?.phone ? (
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.user.phone}`)}>
          <Ionicons name="call" size={16} color={COLORS.white} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.user?._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            customers.length > 0 ? (
              <Text style={styles.countText}>{customers.length} customer{customers.length === 1 ? '' : 's'}</Text>
            ) : null
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No customers yet</Text>
              <Text style={styles.emptySub}>Customers appear here once they book your facility</Text>
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
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  countText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.md, backgroundColor: COLORS.surface },
  body: { flex: 1 },
  name: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginVertical: 4 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    gap: 4,
  },
  statText: { fontSize: FONTS.sizes.xs, color: COLORS.text, fontWeight: '600', marginLeft: 4 },
  callBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success,
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { marginTop: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '600' },
  emptySub: { marginTop: SPACING.xs, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.xl },
});

export default OwnerCustomersScreen;
