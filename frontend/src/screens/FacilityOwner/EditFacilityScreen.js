import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { getOwnerAuthConfig } from '../../utils/ownerAuth';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
    />
  </View>
);

const EditFacilityScreen = ({ navigation, route }) => {
  const facilityId = route.params?.facilityId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', state: '', pincode: '',
    contactPhone: '', contactEmail: '', pricePerHour: '', isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      if (!facilityId) { setLoading(false); return; }
      try {
        const config = await getOwnerAuthConfig();
        const res = await api.get(API_ENDPOINTS.GET_MY_FACILITIES, config);
        const fac = (res.data.facilities || []).find((f) => f._id === facilityId);
        if (fac) {
          setForm({
            name: fac.name || '',
            description: fac.description || '',
            address: fac.address || '',
            city: fac.city || '',
            state: fac.state || '',
            pincode: fac.pincode || '',
            contactPhone: fac.contactPhone || '',
            contactEmail: fac.contactEmail || '',
            pricePerHour: fac.pricePerHour != null ? String(fac.pricePerHour) : '',
            isActive: fac.isActive !== false,
          });
        }
      } catch (error) {
        console.error('Load facility error:', error?.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [facilityId]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city) {
      Alert.alert('Error', 'Name, address and city are required');
      return;
    }
    setSaving(true);
    try {
      const config = await getOwnerAuthConfig();
      await api.put(API_ENDPOINTS.UPDATE_FACILITY(facilityId), {
        ...form,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
      }, config);
      Alert.alert('Saved', 'Facility details updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update facility');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Facility</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <Field label="Facility Name" value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Green Turf Arena" />
          <Field label="Description" value={form.description} onChangeText={(v) => set('description', v)} placeholder="Describe your facility" multiline />
          <Field label="Price per Hour (₹)" value={form.pricePerHour} onChangeText={(v) => set('pricePerHour', v)} placeholder="600" keyboardType="numeric" />

          <Text style={styles.sectionTitle}>Address</Text>
          <Field label="Street Address" value={form.address} onChangeText={(v) => set('address', v)} placeholder="Full street address" multiline />
          <Field label="City" value={form.city} onChangeText={(v) => set('city', v)} placeholder="City" />
          <Field label="State" value={form.state} onChangeText={(v) => set('state', v)} placeholder="State" />
          <Field label="Pincode" value={form.pincode} onChangeText={(v) => set('pincode', v)} placeholder="Pincode" keyboardType="numeric" />

          <Text style={styles.sectionTitle}>Contact</Text>
          <Field label="Contact Phone" value={form.contactPhone} onChangeText={(v) => set('contactPhone', v)} placeholder="Phone number" keyboardType="phone-pad" />
          <Field label="Contact Email" value={form.contactEmail} onChangeText={(v) => set('contactEmail', v)} placeholder="Email" keyboardType="email-address" />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Accepting Bookings</Text>
              <Text style={styles.switchSub}>{form.isActive ? 'Your facility is visible & bookable' : 'Bookings paused — facility hidden'}</Text>
            </View>
            <Switch
              value={form.isActive}
              onValueChange={(v) => set('isActive', v)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.primary, marginTop: SPACING.md, marginBottom: SPACING.md },
  field: { marginBottom: SPACING.lg },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  switchSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});

export default EditFacilityScreen;
