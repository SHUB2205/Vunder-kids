import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(user?.isPrivate || false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress && !rightElement}>
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

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="Account">
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy"
            subtitle={privateAccount ? 'Private Account' : 'Public Account'}
            rightElement={
              <Switch
                value={privateAccount}
                onValueChange={setPrivateAccount}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Security"
            onPress={() => Alert.alert('Security', 'Security settings coming soon')}
          />
        </SettingSection>

        <SettingSection title="Preferences">
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Language', 'Language settings coming soon')}
          />
        </SettingSection>

        <SettingSection title="Content">
          <SettingItem
            icon="bookmark-outline"
            title="Saved Posts"
            onPress={() => Alert.alert('Saved', 'Saved posts coming soon')}
          />
          <SettingItem
            icon="archive-outline"
            title="Archive"
            onPress={() => Alert.alert('Archive', 'Archive coming soon')}
          />
          <SettingItem
            icon="time-outline"
            title="Your Activity"
            onPress={() => Alert.alert('Activity', 'Activity log coming soon')}
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => Alert.alert('Help', 'Help center coming soon')}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About', 'Fisiko v1.0.0\nThe Sports Social Network')}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon')}
          />
          <SettingItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon')}
          />
        </SettingSection>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Fisiko</Text>
          <Text style={styles.footerSubtext}>The Sports Social Network</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  footerText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  footerSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});

export default SettingsScreen;
