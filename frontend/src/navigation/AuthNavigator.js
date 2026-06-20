import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import { TermsScreen, PrivacyPolicyScreen, EULAScreen } from '../screens/Legal';
import { COLORS } from '../config/theme';

// Facility Owner flow — accessible before a regular user logs in
import {
  OwnerLoginScreen,
  OwnerRegisterScreen,
  OwnerOnboardingScreen,
  OwnerDashboardScreen,
  ManageScheduleScreen,
  ManagePricingScreen,
  ManagePhotosScreen,
  OwnerBookingsScreen,
  BookingDetailScreen,
  OwnerCustomersScreen,
  OwnerPaymentsScreen,
  EditFacilityScreen,
  OwnerNotificationsScreen,
} from '../screens/FacilityOwner';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [checking, setChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const resolveStart = async () => {
      try {
        // Restore a persisted facility-owner session if present
        const ownerToken = await AsyncStorage.getItem('ownerToken');
        const ownerDataRaw = await AsyncStorage.getItem('ownerData');
        if (ownerToken && ownerDataRaw) {
          const ownerData = JSON.parse(ownerDataRaw);
          const onboarded = ownerData.onboardingComplete || (ownerData.facilities?.length > 0);
          setInitialRoute(onboarded ? 'OwnerDashboard' : 'OwnerOnboarding');
        }
      } catch (error) {
        console.error('Auth start resolution error:', error);
      } finally {
        setChecking(false);
      }
    };
    resolveStart();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Regular user auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="EULA" component={EULAScreen} />

      {/* Facility owner auth + portal */}
      <Stack.Screen name="OwnerLogin" component={OwnerLoginScreen} />
      <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} />
      <Stack.Screen name="OwnerOnboarding" component={OwnerOnboardingScreen} />
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      <Stack.Screen name="ManageSchedule" component={ManageScheduleScreen} />
      <Stack.Screen name="ManagePricing" component={ManagePricingScreen} />
      <Stack.Screen name="ManagePhotos" component={ManagePhotosScreen} />
      <Stack.Screen name="AllBookings" component={OwnerBookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="OwnerCustomers" component={OwnerCustomersScreen} />
      <Stack.Screen name="OwnerPayments" component={OwnerPaymentsScreen} />
      <Stack.Screen name="EditFacility" component={EditFacilityScreen} />
      <Stack.Screen name="OwnerNotifications" component={OwnerNotificationsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
