import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';
import api from '../../config/axios';

const SecurityScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (passwords.new.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      Alert.alert('Success', 'Password changed successfully');
      setShowChangePassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'This will add an extra layer of security to your account. You will need to verify your identity when logging in from new devices.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => setTwoFactorEnabled(true) },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress} 
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your password regularly"
              onPress={() => setShowChangePassword(!showChangePassword)}
            />
            
            {showChangePassword && (
              <View style={styles.passwordForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry
                  value={passwords.current}
                  onChangeText={(v) => setPasswords(p => ({ ...p, current: v }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry
                  value={passwords.new}
                  onChangeText={(v) => setPasswords(p => ({ ...p, new: v }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry
                  value={passwords.confirm}
                  onChangeText={(v) => setPasswords(p => ({ ...p, confirm: v }))}
                />
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.changeButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Two-Factor Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="shield-checkmark-outline"
              title="Two-Factor Authentication"
              subtitle={twoFactorEnabled ? 'Enabled' : 'Disabled'}
              rightElement={
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={handleToggle2FA}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              }
              showArrow={false}
            />
          </View>
        </View>

        {/* Login Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login Activity</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications-outline"
              title="Login Alerts"
              subtitle="Get notified of new logins"
              rightElement={
                <Switch
                  value={loginAlerts}
                  onValueChange={setLoginAlerts}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="phone-portrait-outline"
              title="Active Sessions"
              subtitle="Manage devices logged into your account"
              onPress={() => Alert.alert('Active Sessions', 'You are currently logged in on 1 device.')}
            />
            <SettingItem
              icon="log-out-outline"
              title="Log Out All Devices"
              subtitle="Sign out from all other devices"
              onPress={() => {
                Alert.alert(
                  'Log Out All Devices',
                  'This will sign you out from all other devices. You will need to log in again on those devices.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out All', style: 'destructive', onPress: () => Alert.alert('Success', 'Logged out from all other devices') },
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="mail-outline"
              title="Email"
              subtitle={user?.email || 'Not set'}
              onPress={() => Alert.alert('Email', 'Email cannot be changed for security reasons.')}
            />
            <SettingItem
              icon="call-outline"
              title="Phone Number"
              subtitle={user?.phone || 'Not set'}
              onPress={() => Alert.alert('Phone', 'Add a phone number for account recovery.')}
            />
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  passwordForm: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  changeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default SecurityScreen;
