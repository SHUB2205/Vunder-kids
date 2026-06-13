import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const ManagePricingScreen = ({ navigation, route }) => {
  const { facilityId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facility, setFacility] = useState(null);
  
  const [basePrice, setBasePrice] = useState('');
  const [sportPricing, setSportPricing] = useState({});
  const [weekendPricing, setWeekendPricing] = useState({ enabled: false, multiplier: 1.2 });
  const [peakHourPricing, setPeakHourPricing] = useState({ enabled: false, multiplier: 1.5 });
  const [discounts, setDiscounts] = useState({
    earlyBird: { enabled: false, percent: 10, beforeHour: '08:00' },
    bulkBooking: { enabled: false, percent: 15, minSlots: 3 },
    membership: { enabled: false, percent: 20 },
  });

  useEffect(() => {
    fetchFacilityPricing();
  }, []);

  const fetchFacilityPricing = async () => {
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const res = await api.get(API_ENDPOINTS.GET_FACILITY(facilityId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fac = res.data.facility;
      setFacility(fac);
      setBasePrice(fac.pricePerHour?.toString() || '');
      
      if (fac.sportPricing) setSportPricing(fac.sportPricing);
      if (fac.weekendPricing) setWeekendPricing(fac.weekendPricing);
      if (fac.peakHourPricing) setPeakHourPricing(fac.peakHourPricing);
      if (fac.discounts) setDiscounts(fac.discounts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!basePrice) {
      Alert.alert('Error', 'Please enter a base price');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      await api.put(API_ENDPOINTS.UPDATE_FACILITY(facilityId), {
        pricePerHour: parseFloat(basePrice),
        sportPricing,
        weekendPricing,
        peakHourPricing,
        discounts,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Pricing updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Pricing</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Base Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Price</Text>
          <Text style={styles.sectionSubtitle}>Default hourly rate for all sports</Text>
          
          <View style={styles.basePriceCard}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.priceInput}
                value={basePrice}
                onChangeText={setBasePrice}
                placeholder="500"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
              />
              <Text style={styles.perHourText}>/ hour</Text>
            </View>
          </View>
        </View>

        {/* Sport-specific Pricing */}
        {facility?.sports?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sport-specific Pricing</Text>
            <Text style={styles.sectionSubtitle}>Set different prices for each sport</Text>
            
            <View style={styles.sportPricingCard}>
              {facility.sports.map((sport) => (
                <View key={sport} style={styles.sportPriceRow}>
                  <View style={styles.sportInfo}>
                    <Text style={styles.sportEmoji}>{getSportEmoji(sport)}</Text>
                    <Text style={styles.sportName}>{sport}</Text>
                  </View>
                  <View style={styles.sportPriceInputWrap}>
                    <Text style={styles.currencySmall}>₹</Text>
                    <TextInput
                      style={styles.sportPriceInput}
                      value={sportPricing[sport]?.toString() || ''}
                      onChangeText={(v) => setSportPricing(prev => ({ ...prev, [sport]: v }))}
                      placeholder={basePrice || '500'}
                      placeholderTextColor={COLORS.textLight}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Weekend Pricing */}
        <View style={styles.section}>
          <View style={styles.toggleSection}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Weekend Pricing</Text>
              <Text style={styles.toggleSubtitle}>Higher prices on Sat & Sun</Text>
            </View>
            <Switch
              value={weekendPricing.enabled}
              onValueChange={(v) => setWeekendPricing(prev => ({ ...prev, enabled: v }))}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={weekendPricing.enabled ? COLORS.primary : COLORS.textLight}
            />
          </View>
          
          {weekendPricing.enabled && (
            <View style={styles.multiplierSection}>
              <Text style={styles.multiplierLabel}>Price Multiplier</Text>
              <View style={styles.multiplierButtons}>
                {[1.1, 1.2, 1.3, 1.5].map((mult) => (
                  <TouchableOpacity
                    key={mult}
                    style={[
                      styles.multiplierChip,
                      weekendPricing.multiplier === mult && styles.multiplierChipActive,
                    ]}
                    onPress={() => setWeekendPricing(prev => ({ ...prev, multiplier: mult }))}
                  >
                    <Text style={[
                      styles.multiplierChipText,
                      weekendPricing.multiplier === mult && styles.multiplierChipTextActive,
                    ]}>
                      {mult}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.previewText}>
                Weekend price: ₹{Math.round(parseFloat(basePrice || 0) * weekendPricing.multiplier)}/hr
              </Text>
            </View>
          )}
        </View>

        {/* Peak Hour Pricing */}
        <View style={styles.section}>
          <View style={styles.toggleSection}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Peak Hour Pricing</Text>
              <Text style={styles.toggleSubtitle}>Higher prices during busy hours (5-9 PM)</Text>
            </View>
            <Switch
              value={peakHourPricing.enabled}
              onValueChange={(v) => setPeakHourPricing(prev => ({ ...prev, enabled: v }))}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={peakHourPricing.enabled ? COLORS.primary : COLORS.textLight}
            />
          </View>
          
          {peakHourPricing.enabled && (
            <View style={styles.multiplierSection}>
              <Text style={styles.multiplierLabel}>Price Multiplier</Text>
              <View style={styles.multiplierButtons}>
                {[1.25, 1.5, 1.75, 2.0].map((mult) => (
                  <TouchableOpacity
                    key={mult}
                    style={[
                      styles.multiplierChip,
                      peakHourPricing.multiplier === mult && styles.multiplierChipActive,
                    ]}
                    onPress={() => setPeakHourPricing(prev => ({ ...prev, multiplier: mult }))}
                  >
                    <Text style={[
                      styles.multiplierChipText,
                      peakHourPricing.multiplier === mult && styles.multiplierChipTextActive,
                    ]}>
                      {mult}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.previewText}>
                Peak hour price: ₹{Math.round(parseFloat(basePrice || 0) * peakHourPricing.multiplier)}/hr
              </Text>
            </View>
          )}
        </View>

        {/* Discounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discounts</Text>
          
          {/* Early Bird */}
          <View style={styles.discountCard}>
            <View style={styles.toggleSection}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>🌅 Early Bird Discount</Text>
                <Text style={styles.toggleSubtitle}>Discount for morning slots</Text>
              </View>
              <Switch
                value={discounts.earlyBird.enabled}
                onValueChange={(v) => setDiscounts(prev => ({
                  ...prev,
                  earlyBird: { ...prev.earlyBird, enabled: v }
                }))}
                trackColor={{ false: COLORS.border, true: COLORS.success + '50' }}
                thumbColor={discounts.earlyBird.enabled ? COLORS.success : COLORS.textLight}
              />
            </View>
            {discounts.earlyBird.enabled && (
              <View style={styles.discountOptions}>
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>Discount</Text>
                  <View style={styles.percentButtons}>
                    {[5, 10, 15, 20].map((pct) => (
                      <TouchableOpacity
                        key={pct}
                        style={[
                          styles.percentChip,
                          discounts.earlyBird.percent === pct && styles.percentChipActive,
                        ]}
                        onPress={() => setDiscounts(prev => ({
                          ...prev,
                          earlyBird: { ...prev.earlyBird, percent: pct }
                        }))}
                      >
                        <Text style={[
                          styles.percentChipText,
                          discounts.earlyBird.percent === pct && styles.percentChipTextActive,
                        ]}>
                          {pct}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Bulk Booking */}
          <View style={styles.discountCard}>
            <View style={styles.toggleSection}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>📦 Bulk Booking Discount</Text>
                <Text style={styles.toggleSubtitle}>Discount for multiple slots</Text>
              </View>
              <Switch
                value={discounts.bulkBooking.enabled}
                onValueChange={(v) => setDiscounts(prev => ({
                  ...prev,
                  bulkBooking: { ...prev.bulkBooking, enabled: v }
                }))}
                trackColor={{ false: COLORS.border, true: COLORS.success + '50' }}
                thumbColor={discounts.bulkBooking.enabled ? COLORS.success : COLORS.textLight}
              />
            </View>
            {discounts.bulkBooking.enabled && (
              <View style={styles.discountOptions}>
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>Discount</Text>
                  <View style={styles.percentButtons}>
                    {[10, 15, 20, 25].map((pct) => (
                      <TouchableOpacity
                        key={pct}
                        style={[
                          styles.percentChip,
                          discounts.bulkBooking.percent === pct && styles.percentChipActive,
                        ]}
                        onPress={() => setDiscounts(prev => ({
                          ...prev,
                          bulkBooking: { ...prev.bulkBooking, percent: pct }
                        }))}
                      >
                        <Text style={[
                          styles.percentChipText,
                          discounts.bulkBooking.percent === pct && styles.percentChipTextActive,
                        ]}>
                          {pct}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>Min. Slots</Text>
                  <View style={styles.percentButtons}>
                    {[2, 3, 4, 5].map((slots) => (
                      <TouchableOpacity
                        key={slots}
                        style={[
                          styles.percentChip,
                          discounts.bulkBooking.minSlots === slots && styles.percentChipActive,
                        ]}
                        onPress={() => setDiscounts(prev => ({
                          ...prev,
                          bulkBooking: { ...prev.bulkBooking, minSlots: slots }
                        }))}
                      >
                        <Text style={[
                          styles.percentChipText,
                          discounts.bulkBooking.minSlots === slots && styles.percentChipTextActive,
                        ]}>
                          {slots}+
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
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
  saveButton: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  basePriceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  priceInput: {
    flex: 1,
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
  },
  perHourText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  sportPricingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  sportPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  sportName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sportPriceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
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
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  toggleSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  multiplierSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    ...SHADOWS.small,
  },
  multiplierLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  multiplierButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  multiplierChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiplierChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  multiplierChipText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  multiplierChipTextActive: {
    color: COLORS.primary,
  },
  previewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  discountCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  discountOptions: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  discountRow: {
    marginBottom: SPACING.md,
  },
  discountLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  percentButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  percentChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  percentChipActive: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  percentChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  percentChipTextActive: {
    color: COLORS.success,
  },
});

export default ManagePricingScreen;
