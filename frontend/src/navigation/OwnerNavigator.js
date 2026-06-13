import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../config/theme';

// Import Owner Screens
import {
  OwnerLoginScreen,
  OwnerRegisterScreen,
  OwnerOnboardingScreen,
  OwnerDashboardScreen,
  ManageScheduleScreen,
  ManagePricingScreen,
  ManagePhotosScreen,
} from '../screens/FacilityOwner';

const Stack = createNativeStackNavigator();

const OwnerNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const ownerData = await AsyncStorage.getItem('ownerData');
      
      if (token && ownerData) {
        setIsAuthenticated(true);
        const parsed = JSON.parse(ownerData);
        setHasCompletedOnboarding(parsed.onboardingComplete || (parsed.facilities?.length > 0));
      }
    } catch (error) {
      console.error('Check auth status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={
        isAuthenticated 
          ? (hasCompletedOnboarding ? 'OwnerDashboard' : 'OwnerOnboarding')
          : 'OwnerLogin'
      }
    >
      {/* Auth Screens */}
      <Stack.Screen name="OwnerLogin" component={OwnerLoginScreen} />
      <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} />
      
      {/* Onboarding */}
      <Stack.Screen name="OwnerOnboarding" component={OwnerOnboardingScreen} />
      
      {/* Main Dashboard */}
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      
      {/* Management Screens */}
      <Stack.Screen name="ManageSchedule" component={ManageScheduleScreen} />
      <Stack.Screen name="ManagePricing" component={ManagePricingScreen} />
      <Stack.Screen name="ManagePhotos" component={ManagePhotosScreen} />
    </Stack.Navigator>
  );
};

export default OwnerNavigator;
