import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/Onboarding/AboutScreen';
import PassionScreen from '../screens/Onboarding/PassionScreen';
import UploadPictureScreen from '../screens/Onboarding/UploadPictureScreen';
import WaitingScreen from '../screens/Onboarding/WaitingScreen';

const Stack = createNativeStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Passion" component={PassionScreen} />
      <Stack.Screen name="UploadPicture" component={UploadPictureScreen} />
      <Stack.Screen name="Waiting" component={WaitingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
