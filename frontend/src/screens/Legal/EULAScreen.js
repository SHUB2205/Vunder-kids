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

const EULAScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>End User License Agreement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: February 25, 2026</Text>

        <Text style={styles.paragraph}>
          This End User License Agreement ("EULA") is a legal agreement between you ("User") and Fisiko ("Company," "we," "us," or "our") for the use of the Fisiko mobile application ("App").
        </Text>

        <Text style={styles.sectionTitle}>1. License Grant</Text>
        <Text style={styles.paragraph}>
          Subject to your compliance with this EULA, we grant you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the App on a mobile device that you own or control, solely for your personal, non-commercial purposes.
        </Text>

        <Text style={styles.sectionTitle}>2. License Restrictions</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>• Copy, modify, or distribute the App</Text>
        <Text style={styles.bulletPoint}>• Reverse engineer, decompile, or disassemble the App</Text>
        <Text style={styles.bulletPoint}>• Rent, lease, lend, sell, or sublicense the App</Text>
        <Text style={styles.bulletPoint}>• Remove any proprietary notices from the App</Text>
        <Text style={styles.bulletPoint}>• Use the App for any illegal or unauthorized purpose</Text>
        <Text style={styles.bulletPoint}>• Use the App to transmit malware or harmful code</Text>

        <Text style={styles.sectionTitle}>3. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The App and all copies thereof are proprietary to the Company and title remains with us. All rights in the App not specifically granted in this EULA are reserved to us. The App is protected by copyright and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>4. User Content</Text>
        <Text style={styles.paragraph}>
          You retain all rights to content you create and share through the App. By using the App, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content solely for the purpose of operating and providing the App.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          The App may integrate with or provide access to third-party services. Your use of such services is subject to their respective terms and conditions. We are not responsible for third-party services.
        </Text>

        <Text style={styles.sectionTitle}>6. Updates and Changes</Text>
        <Text style={styles.paragraph}>
          We may update the App from time to time. Updates may be required for continued use of the App. We may also modify this EULA at any time. Continued use of the App after changes constitutes acceptance of the modified EULA.
        </Text>

        <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
        </Text>

        <Text style={styles.sectionTitle}>9. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the App or violation of this EULA.
        </Text>

        <Text style={styles.sectionTitle}>10. Termination</Text>
        <Text style={styles.paragraph}>
          This EULA is effective until terminated. Your rights under this EULA will terminate automatically if you fail to comply with any of its terms. Upon termination, you must cease all use of the App and delete all copies.
        </Text>

        <Text style={styles.sectionTitle}>11. Governing Law</Text>
        <Text style={styles.paragraph}>
          This EULA shall be governed by and construed in accordance with the laws of the jurisdiction in which the Company is established, without regard to its conflict of law provisions.
        </Text>

        <Text style={styles.sectionTitle}>12. Severability</Text>
        <Text style={styles.paragraph}>
          If any provision of this EULA is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.
        </Text>

        <Text style={styles.sectionTitle}>13. Entire Agreement</Text>
        <Text style={styles.paragraph}>
          This EULA constitutes the entire agreement between you and the Company regarding the App and supersedes all prior agreements and understandings.
        </Text>

        <Text style={styles.sectionTitle}>14. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about this EULA, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>legal@fisiko.io</Text>

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
    fontSize: FONTS.sizes.md,
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

export default EULAScreen;
