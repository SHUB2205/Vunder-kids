import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useMatch } from '../../context/MatchContext';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

// Top Search Items - like PWA Search.js topSearchItems
const TOP_SEARCH_ITEMS = [
  { label: 'Cricket', icon: 'baseball' },
  { label: 'Badminton', icon: 'tennisball' },
  { label: 'Tennis', icon: 'tennisball' },
  { label: 'Basketball', icon: 'basketball' },
  { label: 'Football', icon: 'football' },
  { label: 'Soccer', icon: 'football-outline' },
];

const SearchScreen = ({ navigation, route }) => {
  // State - like PWA Search.js
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'foryou', 'people'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });

  // Debounced search - like PWA debouncedSearch
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
      setSearchResults({
        users: response.data.users || [],
        posts: response.data.posts || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ users: [], posts: [] });
    }
    setLoading(false);
  }, []);

  // Handle search input - like PWA handleSearchInput
  const handleSearchInput = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveTab('foryou');
      // Debounce search
      const timeoutId = setTimeout(() => performSearch(query), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setActiveTab('search');
      setSearchResults({ users: [], posts: [] });
    }
  };

  // Handle search item click - like PWA handleSearchItemClick
  const handleSearchItemClick = (label) => {
    setSearchQuery(label);
    setActiveTab('foryou');
    performSearch(label);
  };

  // Render search item - like PWA SearchItem
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleSearchItemClick(item.label)}
    >
      <View style={styles.searchItemIcon}>
        <Ionicons name={item.icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.searchItemLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  // Render user result - like PWA People component
  const renderUserResult = ({ item }) => (
    <TouchableOpacity
      style={styles.userResult}
      onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.userName || item.name}</Text>
        <Text style={styles.userBio} numberOfLines={1}>{item.bio || 'Fisiko user'}</Text>
      </View>
      <TouchableOpacity style={styles.followBtn}>
        <Text style={styles.followBtnText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render post result - like PWA ForYou component
  const renderPostResult = ({ item }) => (
    <TouchableOpacity
      style={styles.postResult}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      {item.mediaURL && (
        <Image source={{ uri: item.mediaURL }} style={styles.postImage} />
      )}
      <View style={styles.postInfo}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: item.creator?.avatar || 'https://via.placeholder.com/30' }}
            style={styles.postCreatorAvatar}
          />
          <Text style={styles.postCreatorName}>{item.creator?.userName || 'User'}</Text>
        </View>
        <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      </View>
    </TouchableOpacity>
  );

  // Default content - Top Search like PWA
  const renderDefaultContent = () => (
    <View style={styles.defaultContent}>
      <Text style={styles.heading}>Top Search</Text>
      <View style={styles.gridContainer}>
        {TOP_SEARCH_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.searchItem}
            onPress={() => handleSearchItemClick(item.label)}
          >
            <View style={styles.searchItemIcon}>
              <Ionicons name={item.icon} size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.searchItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Search results content - like PWA ForYou and People
  const renderSearchResults = () => (
    <View style={styles.searchResultsContainer}>
      {/* Toggle tabs */}
      <View style={styles.searchToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'foryou' && styles.activeToggle]}
          onPress={() => setActiveTab('foryou')}
        >
          <Text style={[styles.toggleText, activeTab === 'foryou' && styles.activeToggleText]}>For you</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'people' && styles.activeToggle]}
          onPress={() => setActiveTab('people')}
        >
          <Text style={[styles.toggleText, activeTab === 'people' && styles.activeToggleText]}>People</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {activeTab === 'foryou' && (
        <FlatList
          data={[...searchResults.users.slice(0, 3), ...searchResults.posts]}
          renderItem={({ item }) => 
            item.avatar !== undefined ? renderUserResult({ item }) : renderPostResult({ item })
          }
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
            </View>
          }
        />
      )}

      {activeTab === 'people' && (
        <FlatList
          data={searchResults.users}
          renderItem={renderUserResult}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header - like PWA searchHeader */}
      <View style={styles.topHeader}>
        <View style={styles.searchHeader}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchInput('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {searchQuery ? renderSearchResults() : renderDefaultContent()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // Header - like PWA topHeader
  topHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Default Content - like PWA
  defaultContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  heading: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  searchItemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  searchItemLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Search Results
  searchResultsContainer: {
    flex: 1,
  },
  searchToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginRight: SPACING.md,
  },
  activeToggle: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  toggleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  activeToggleText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultsList: {
    padding: SPACING.md,
  },
  // User Result - like PWA People
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userBio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  followBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  // Post Result - like PWA ForYou
  postResult: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  postImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.surface,
  },
  postInfo: {
    padding: SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postCreatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  postCreatorName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  postContent: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  noResultsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
});

export default SearchScreen;
