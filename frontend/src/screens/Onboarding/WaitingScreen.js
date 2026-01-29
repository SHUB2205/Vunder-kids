import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS } from '../../config/theme';

const WaitingScreen = () => {
  const { updateUser, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const steps = [
    { icon: 'person-circle', text: 'Setting up your profile...' },
    { icon: 'people', text: 'Finding sports enthusiasts near you...' },
    { icon: 'trophy', text: 'Preparing your personalized feed...' },
    { icon: 'checkmark-circle', text: 'All done!' },
  ];

  useEffect(() => {
    animateStep();
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const completeOnboarding = async () => {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      await updateUser({ isVerified: true });
      await refreshUser();
    };

    completeOnboarding();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    animateStep();
  }, [step]);

  const animateStep = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.step}>Step 4 of 4</Text>
        </View>

        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Ionicons
                name={steps[step].icon}
                size={80}
                color={step === steps.length - 1 ? COLORS.success : COLORS.primary}
              />
            </Animated.View>
          </View>

          <Animated.Text style={[styles.statusText, { opacity: fadeAnim }]}>
            {steps[step].text}
          </Animated.Text>

          {step < steps.length - 1 && (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={styles.loader}
            />
          )}

          <View style={styles.dotsContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === step && styles.dotActive,
                  index < step && styles.dotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We're personalizing your experience based on your interests
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  header: {
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  step: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  statusText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  loader: {
    marginBottom: SPACING.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  dotCompleted: {
    backgroundColor: COLORS.success,
  },
  footer: {
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default WaitingScreen;
