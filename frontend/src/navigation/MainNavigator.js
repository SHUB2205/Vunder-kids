import React, { useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Text, Animated, PanResponder, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Booking Screens (New Home)
import { BookingHomeScreen, FacilityDetailScreen, MyBookingsScreen } from '../screens/Booking';

// Matches Screens
import MatchesScreen from '../screens/Matches/MatchesScreen';
import CreateMatchScreen from '../screens/Matches/CreateMatchScreen';
import MatchDetailScreen from '../screens/Matches/MatchDetailScreen';
import SetScoreScreen from '../screens/Matches/SetScoreScreen';

// Discover/Map Screen
import { DiscoverScreen } from '../screens/Discover';

// Profile Screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import EditPassionsScreen from '../screens/Profile/EditPassionsScreen';
import FollowersScreen from '../screens/Profile/FollowersScreen';
import FollowingScreen from '../screens/Profile/FollowingScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import SecurityScreen from '../screens/Profile/SecurityScreen';
import LanguageScreen from '../screens/Profile/LanguageScreen';
import SavedScreen from '../screens/Profile/SavedScreen';

// Messages
import MessagesScreen from '../screens/Messages/MessagesScreen';
import ChatScreen from '../screens/Messages/ChatScreen';

// Notifications
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

// Facilities (legacy - for facility owners)
import FacilitiesScreen from '../screens/Facilities/FacilitiesScreen';
import BookFacilityScreen from '../screens/Facilities/BookFacilityScreen';
import AddFacilityScreen from '../screens/Facilities/AddFacilityScreen';

// Facility Owner
import { 
  FacilityOwnerDashboard,
  OwnerLoginScreen,
  OwnerRegisterScreen,
  OwnerOnboardingScreen,
  OwnerDashboardScreen,
  ManageScheduleScreen,
  ManagePricingScreen,
  ManagePhotosScreen,
} from '../screens/FacilityOwner';

// AI Assistant
import AIAssistantScreen from '../screens/AI/AIAssistantScreen';

// Sports
import SportProfileScreen from '../screens/Sports/SportProfileScreen';
import SportSearchScreen from '../screens/Sports/SportSearchScreen';
import LiveSportScreen from '../screens/Sports/LiveSportScreen';

// Legal
import { TermsScreen, PrivacyPolicyScreen, EULAScreen } from '../screens/Legal';

import { COLORS } from '../config/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Book Tab - Facility Booking (New Home)
const BookStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BookingHome" component={BookingHomeScreen} />
    <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="Messages" component={MessagesScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
    <Stack.Screen name="SetScore" component={SetScoreScreen} />
    <Stack.Screen name="AddFacility" component={AddFacilityScreen} />
  </Stack.Navigator>
);

// Matches Tab
const MatchesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MatchesMain" component={MatchesScreen} />
    <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    <Stack.Screen name="SetScore" component={SetScoreScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

// Discover Tab - Find Players (Map)
const DiscoverStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Messages" component={MessagesScreen} />
    <Stack.Screen name="SportProfile" component={SportProfileScreen} />
    <Stack.Screen name="SportSearch" component={SportSearchScreen} />
    <Stack.Screen name="LiveSport" component={LiveSportScreen} />
  </Stack.Navigator>
);

// Profile Tab
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="EditPassions" component={EditPassionsScreen} />
    <Stack.Screen name="Followers" component={FollowersScreen} />
    <Stack.Screen name="Following" component={FollowingScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    <Stack.Screen name="SetScore" component={SetScoreScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
    <Stack.Screen name="Saved" component={SavedScreen} />
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="Messages" component={MessagesScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="EULA" component={EULAScreen} />
    <Stack.Screen name="AddFacility" component={AddFacilityScreen} />
    <Stack.Screen name="Facilities" component={FacilitiesScreen} />
    <Stack.Screen name="FacilityOwnerDashboard" component={FacilityOwnerDashboard} />
    <Stack.Screen name="OwnerLogin" component={OwnerLoginScreen} />
    <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} />
    <Stack.Screen name="OwnerOnboarding" component={OwnerOnboardingScreen} />
    <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
    <Stack.Screen name="ManageSchedule" component={ManageScheduleScreen} />
    <Stack.Screen name="ManagePricing" component={ManagePricingScreen} />
    <Stack.Screen name="ManagePhotos" component={ManagePhotosScreen} />
  </Stack.Navigator>
);

// Draggable Floating Action Buttons Component - matching PWA OpenAiBtn
const FloatingButtons = () => {
  const navigation = useNavigation();
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 76, y: SCREEN_HEIGHT - 200 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        setIsDragging(false);
        
        // Snap to edges
        const currentX = pan.x._value;
        const snapX = currentX < SCREEN_WIDTH / 2 ? 16 : SCREEN_WIDTH - 76;
        
        // Keep within bounds
        let currentY = pan.y._value;
        currentY = Math.max(100, Math.min(currentY, SCREEN_HEIGHT - 200));
        
        Animated.spring(pan, {
          toValue: { x: snapX, y: currentY },
          useNativeDriver: false,
          friction: 5,
        }).start();
      },
    })
  ).current;

  const handleChatbotPress = () => {
    if (!isDragging) {
      navigation.navigate('Profile', { screen: 'AIAssistant' });
    }
  };

  const handleMatchPress = () => {
    if (!isDragging) {
      navigation.navigate('Matches', { screen: 'CreateMatch' });
    }
  };

  return (
    <Animated.View
      style={[styles.floatingContainer, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      {/* Chatbot Button */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={handleChatbotPress}
        activeOpacity={0.8}
      >
        <View style={styles.chatbotInner}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
          <Text style={styles.robotEmoji}>🤖</Text>
        </View>
      </TouchableOpacity>

      {/* Set Match Button (Basketball) */}
      <TouchableOpacity
        style={styles.matchButton}
        onPress={handleMatchPress}
        activeOpacity={0.8}
      >
        <Text style={styles.basketballEmoji}>🏀</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MainNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Book':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Matches':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Discover':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Book" component={BookStack} />
      <Tab.Screen name="Matches" component={MatchesStack} />
      <Tab.Screen name="Discover" component={DiscoverStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
    
    {/* Floating Action Buttons */}
    <FloatingButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 5,
    paddingBottom: 5,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  chatbotButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chatbotInner: {
    alignItems: 'center',
  },
  robotEmoji: {
    fontSize: 10,
    position: 'absolute',
    bottom: -6,
    right: -6,
  },
  matchButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FF6B00',
  },
  basketballEmoji: {
    fontSize: 32,
  },
});

export default MainNavigator;
