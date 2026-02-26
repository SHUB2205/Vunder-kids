import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../config/theme';

const TermsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: February 25, 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using the Fisiko mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Fisiko is a sports social networking platform that allows users to connect with other sports enthusiasts, share content, organize matches, and engage with sports-related content. The App provides features including but not limited to:
        </Text>
        <Text style={styles.bulletPoint}>• User profiles and social networking</Text>
        <Text style={styles.bulletPoint}>• Photo and video sharing (posts and reels)</Text>
        <Text style={styles.bulletPoint}>• Match organization and score tracking</Text>
        <Text style={styles.bulletPoint}>• Messaging and communication features</Text>
        <Text style={styles.bulletPoint}>• Sports facility discovery and booking</Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use certain features of the App, you must create an account. You agree to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide accurate and complete information</Text>
        <Text style={styles.bulletPoint}>• Maintain the security of your account credentials</Text>
        <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized access</Text>
        <Text style={styles.bulletPoint}>• Be responsible for all activities under your account</Text>

        <Text style={styles.sectionTitle}>4. User Content</Text>
        <Text style={styles.paragraph}>
          You retain ownership of content you post on Fisiko. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the App. You agree not to post content that:
        </Text>
        <Text style={styles.bulletPoint}>• Is illegal, harmful, or offensive</Text>
        <Text style={styles.bulletPoint}>• Infringes on intellectual property rights</Text>
        <Text style={styles.bulletPoint}>• Contains spam or misleading information</Text>
        <Text style={styles.bulletPoint}>• Violates the privacy of others</Text>

        <Text style={styles.sectionTitle}>5. Prohibited Conduct</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>• Use the App for any illegal purpose</Text>
        <Text style={styles.bulletPoint}>• Harass, bully, or intimidate other users</Text>
        <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to the App</Text>
        <Text style={styles.bulletPoint}>• Interfere with the proper functioning of the App</Text>
        <Text style={styles.bulletPoint}>• Create multiple accounts for deceptive purposes</Text>

        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The App and its original content, features, and functionality are owned by Fisiko and are protected by international copyright, trademark, and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
        </Text>

        <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
        </Text>

        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, FISIKO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. We will notify users of significant changes through the App or via email. Your continued use of the App after changes constitutes acceptance of the new Terms.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>support@fisiko.io</Text>

        <View style={styles.footer} />
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
    padding: SPACING.lg,
  },
  lastUpdated: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  bulletPoint: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 24,
    marginLeft: SPACING.md,
  },
  contactInfo: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  footer: {
    height: SPACING.xxxl,
  },
});

export default TermsScreen;
