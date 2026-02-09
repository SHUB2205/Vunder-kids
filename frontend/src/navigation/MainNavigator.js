import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import ReelsScreen from '../screens/Reels/ReelsScreen';
import MatchesScreen from '../screens/Matches/MatchesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

import CreatePostScreen from '../screens/Home/CreatePostScreen';
import CreateStoryScreen from '../screens/Home/CreateStoryScreen';
import StoryViewerScreen from '../screens/Home/StoryViewerScreen';
import PostDetailScreen from '../screens/Home/PostDetailScreen';
import CommentsScreen from '../screens/Home/CommentsScreen';

import MessagesScreen from '../screens/Messages/MessagesScreen';
import ChatScreen from '../screens/Messages/ChatScreen';

import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import FollowersScreen from '../screens/Profile/FollowersScreen';
import FollowingScreen from '../screens/Profile/FollowingScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';

import CreateMatchScreen from '../screens/Matches/CreateMatchScreen';
import MatchDetailScreen from '../screens/Matches/MatchDetailScreen';
import SetScoreScreen from '../screens/Matches/SetScoreScreen';

import FacilitiesScreen from '../screens/Facilities/FacilitiesScreen';
import BookFacilityScreen from '../screens/Facilities/BookFacilityScreen';

import AIAssistantScreen from '../screens/AI/AIAssistantScreen';

import { COLORS } from '../config/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
    <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="Comments" component={CommentsScreen} />
    <Stack.Screen name="Messages" component={MessagesScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
    <Stack.Screen name="SetScore" component={SetScoreScreen} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
  </Stack.Navigator>
);

const ReelsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReelsMain" component={ReelsScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
  </Stack.Navigator>
);

const MatchesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MatchesMain" component={MatchesScreen} />
    <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    <Stack.Screen name="SetScore" component={SetScoreScreen} />
    <Stack.Screen name="Facilities" component={FacilitiesScreen} />
    <Stack.Screen name="BookFacility" component={BookFacilityScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Followers" component={FollowersScreen} />
    <Stack.Screen name="Following" component={FollowingScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Reels':
              iconName = focused ? 'play-circle' : 'play-circle-outline';
              break;
            case 'Matches':
              iconName = focused ? 'trophy' : 'trophy-outline';
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
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Reels" component={ReelsStack} />
      <Tab.Screen name="Matches" component={MatchesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
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
});

export default MainNavigator;
