import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ManageScheduleScreen = ({ navigation, route }) => {
  const { facilityId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facility, setFacility] = useState(null);
  
  const [schedule, setSchedule] = useState({
    Monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    Tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    Wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    Thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    Friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    Saturday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    Sunday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
  });
  
  const [slotDuration, setSlotDuration] = useState(60);
  const [blockedDates, setBlockedDates] = useState([]);
  const [peakHours, setPeakHours] = useState({ start: '17:00', end: '21:00', multiplier: 1.5 });

  useEffect(() => {
    fetchFacilitySchedule();
  }, []);

  const fetchFacilitySchedule = async () => {
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const res = await api.get(API_ENDPOINTS.GET_FACILITY(facilityId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fac = res.data.facility;
      setFacility(fac);
      
      // Set schedule from facility data
      if (fac.schedule) {
        setSchedule(fac.schedule);
      } else if (fac.openingHours) {
        // Convert simple opening hours to full schedule
        const newSchedule = {};
        DAYS.forEach(day => {
          newSchedule[day] = {
            isOpen: true,
            openTime: fac.openingHours.open || '06:00',
            closeTime: fac.openingHours.close || '22:00',
          };
        });
        setSchedule(newSchedule);
      }
      
      if (fac.slotDuration) setSlotDuration(fac.slotDuration);
      if (fac.blockedDates) setBlockedDates(fac.blockedDates);
      if (fac.peakHours) setPeakHours(fac.peakHours);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const updateDaySchedule = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const applyToAllDays = (day) => {
    const daySchedule = schedule[day];
    const newSchedule = {};
    DAYS.forEach(d => {
      newSchedule[d] = { ...daySchedule };
    });
    setSchedule(newSchedule);
    Alert.alert('Applied', `${day}'s schedule applied to all days`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      await api.put(API_ENDPOINTS.UPDATE_FACILITY_SCHEDULE(facilityId), {
        schedule,
        slotDuration,
        blockedDates,
        peakHours,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Schedule updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update schedule');
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
        <Text style={styles.headerTitle}>Manage Schedule</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slot Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Slot Duration</Text>
          <View style={styles.slotDurationRow}>
            {[30, 60, 90, 120].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.slotChip,
                  slotDuration === duration && styles.slotChipActive,
                ]}
                onPress={() => setSlotDuration(duration)}
              >
                <Text style={[
                  styles.slotChipText,
                  slotDuration === duration && styles.slotChipTextActive,
                ]}>
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          
          {DAYS.map((day) => (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{day}</Text>
                  <Text style={styles.dayStatus}>
                    {schedule[day].isOpen 
                      ? `${schedule[day].openTime} - ${schedule[day].closeTime}`
                      : 'Closed'}
                  </Text>
                </View>
                <Switch
                  value={schedule[day].isOpen}
                  onValueChange={(value) => updateDaySchedule(day, 'isOpen', value)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                  thumbColor={schedule[day].isOpen ? COLORS.primary : COLORS.textLight}
                />
              </View>
              
              {schedule[day].isOpen && (
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Open</Text>
                    <TextInput
                      style={styles.timeField}
                      value={schedule[day].openTime}
                      onChangeText={(v) => updateDaySchedule(day, 'openTime', v)}
                      placeholder="06:00"
                    />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Close</Text>
                    <TextInput
                      style={styles.timeField}
                      value={schedule[day].closeTime}
                      onChangeText={(v) => updateDaySchedule(day, 'closeTime', v)}
                      placeholder="22:00"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.applyAllButton}
                    onPress={() => applyToAllDays(day)}
                  >
                    <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Peak Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peak Hours Pricing</Text>
          <Text style={styles.sectionSubtitle}>Set higher prices during busy hours</Text>
          
          <View style={styles.peakHoursCard}>
            <View style={styles.peakTimeRow}>
              <View style={styles.peakTimeInput}>
                <Text style={styles.timeLabel}>Start</Text>
                <TextInput
                  style={styles.timeField}
                  value={peakHours.start}
                  onChangeText={(v) => setPeakHours(prev => ({ ...prev, start: v }))}
                  placeholder="17:00"
                />
              </View>
              <View style={styles.peakTimeInput}>
                <Text style={styles.timeLabel}>End</Text>
                <TextInput
                  style={styles.timeField}
                  value={peakHours.end}
                  onChangeText={(v) => setPeakHours(prev => ({ ...prev, end: v }))}
                  placeholder="21:00"
                />
              </View>
            </View>
            <View style={styles.multiplierRow}>
              <Text style={styles.multiplierLabel}>Price Multiplier</Text>
              <View style={styles.multiplierButtons}>
                {[1.0, 1.25, 1.5, 2.0].map((mult) => (
                  <TouchableOpacity
                    key={mult}
                    style={[
                      styles.multiplierChip,
                      peakHours.multiplier === mult && styles.multiplierChipActive,
                    ]}
                    onPress={() => setPeakHours(prev => ({ ...prev, multiplier: mult }))}
                  >
                    <Text style={[
                      styles.multiplierChipText,
                      peakHours.multiplier === mult && styles.multiplierChipTextActive,
                    ]}>
                      {mult}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Block Specific Dates</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Set Holiday Hours</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
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
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  slotDurationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  slotChip: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotChipText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  slotChipTextActive: {
    color: COLORS.white,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayStatus: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timeInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  timeLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timeField: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  applyAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peakHoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  peakTimeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  peakTimeInput: {
    flex: 1,
  },
  multiplierRow: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  multiplierChipText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  multiplierChipTextActive: {
    color: COLORS.success,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  quickActionText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
});

export default ManageScheduleScreen;
