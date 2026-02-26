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

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: February 25, 2026</Text>

        <Text style={styles.paragraph}>
          Fisiko ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        
        <Text style={styles.subTitle}>Personal Information</Text>
        <Text style={styles.paragraph}>
          When you create an account, we collect:
        </Text>
        <Text style={styles.bulletPoint}>• Name and username</Text>
        <Text style={styles.bulletPoint}>• Email address</Text>
        <Text style={styles.bulletPoint}>• Profile photo (optional)</Text>
        <Text style={styles.bulletPoint}>• Date of birth (optional)</Text>
        <Text style={styles.bulletPoint}>• Location (optional)</Text>
        <Text style={styles.bulletPoint}>• Sports interests and skill levels</Text>

        <Text style={styles.subTitle}>Usage Information</Text>
        <Text style={styles.paragraph}>
          We automatically collect:
        </Text>
        <Text style={styles.bulletPoint}>• Device information (type, OS, unique identifiers)</Text>
        <Text style={styles.bulletPoint}>• Log data (access times, pages viewed, app crashes)</Text>
        <Text style={styles.bulletPoint}>• Location data (with your permission)</Text>

        <Text style={styles.subTitle}>Content You Provide</Text>
        <Text style={styles.bulletPoint}>• Posts, photos, and videos you share</Text>
        <Text style={styles.bulletPoint}>• Messages you send to other users</Text>
        <Text style={styles.bulletPoint}>• Comments and reactions</Text>
        <Text style={styles.bulletPoint}>• Match and score information</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide and maintain the App</Text>
        <Text style={styles.bulletPoint}>• Create and manage your account</Text>
        <Text style={styles.bulletPoint}>• Enable social features and connections</Text>
        <Text style={styles.bulletPoint}>• Send notifications about activity</Text>
        <Text style={styles.bulletPoint}>• Improve and personalize your experience</Text>
        <Text style={styles.bulletPoint}>• Respond to your inquiries and support requests</Text>
        <Text style={styles.bulletPoint}>• Detect and prevent fraud or abuse</Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We may share your information with:
        </Text>
        <Text style={styles.bulletPoint}>• Other users (based on your privacy settings)</Text>
        <Text style={styles.bulletPoint}>• Service providers who assist our operations</Text>
        <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>
        <Text style={styles.bulletPoint}>• Business partners (with your consent)</Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access your personal data</Text>
        <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
        <Text style={styles.bulletPoint}>• Delete your account and data</Text>
        <Text style={styles.bulletPoint}>• Export your data</Text>
        <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
        <Text style={styles.bulletPoint}>• Withdraw consent at any time</Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as your account is active or as needed to provide services. You can request deletion of your account at any time through the app settings.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.
        </Text>

        <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          The App may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
        </Text>

        <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy or our data practices, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>privacy@fisiko.io</Text>

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
  subTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
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

export default PrivacyPolicyScreen;
