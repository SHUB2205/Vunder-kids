import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'users', label: 'People', icon: 'people' },
  { id: 'news', label: 'News', icon: 'newspaper' },
  { id: 'sports', label: 'Sports', icon: 'trophy' },
];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState({ users: [], news: [], sports: [] });
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setResults({ users: [], news: [], sports: [] });
    }
  }, [query, category]);

  const fetchTrending = async () => {
    // Mock trending data
    setTrending([
      { id: '1', title: 'Premier League', type: 'sports' },
      { id: '2', title: 'NBA Finals', type: 'sports' },
      { id: '3', title: 'Tennis Grand Slam', type: 'sports' },
      { id: '4', title: 'Local Football Tournament', type: 'news' },
    ]);
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const [usersRes, newsRes, sportsRes] = await Promise.all([
        category === 'all' || category === 'users'
          ? axios.get(`${API_ENDPOINTS.SEARCH_USERS}?q=${query}`)
          : Promise.resolve({ data: { users: [] } }),
        category === 'all' || category === 'news'
          ? axios.get(`${API_ENDPOINTS.SEARCH_NEWS}?q=${query}`)
          : Promise.resolve({ data: { news: [] } }),
        category === 'all' || category === 'sports'
          ? axios.get(`${API_ENDPOINTS.SEARCH_SPORTS}?q=${query}`)
          : Promise.resolve({ data: { sports: [] } }),
      ]);

      setResults({
        users: usersRes.data.users || [],
        news: newsRes.data.news || [],
        sports: sportsRes.data.sports || [],
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.userName || item.name}</Text>
        <Text style={styles.userBio} numberOfLines={1}>
          {item.bio || `${item.followers?.length || 0} followers`}
        </Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity style={styles.newsItem}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.newsCategory}>{item.category}</Text>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.newsSource}>{item.source}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSportsItem = ({ item }) => (
    <TouchableOpacity style={styles.sportsItem}>
      <View style={styles.sportsIcon}>
        <Ionicons name="trophy" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.sportsInfo}>
        <Text style={styles.sportsName}>{item.name}</Text>
        <Text style={styles.sportsType}>{item.type || 'Sport'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }) => (
    <TouchableOpacity style={styles.trendingItem}>
      <View style={styles.trendingIcon}>
        <Ionicons
          name={item.type === 'sports' ? 'trophy' : 'newspaper'}
          size={20}
          color={COLORS.primary}
        />
      </View>
      <Text style={styles.trendingTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const hasResults =
    results.users.length > 0 ||
    results.news.length > 0 ||
    results.sports.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, news, sports..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              category === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon}
              size={18}
              color={category === cat.id ? COLORS.white : COLORS.text}
            />
            <Text
              style={[
                styles.categoryText,
                category === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : query.length === 0 ? (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <FlatList
            data={trending}
            renderItem={renderTrendingItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      ) : hasResults ? (
        <ScrollView style={styles.content}>
          {results.users.length > 0 && (category === 'all' || category === 'users') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>People</Text>
              <FlatList
                data={results.users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          )}

          {results.news.length > 0 && (category === 'all' || category === 'news') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>News</Text>
              <FlatList
                data={results.news}
                renderItem={renderNewsItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          )}

          {results.sports.length > 0 && (category === 'all' || category === 'sports') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sports</Text>
              <FlatList
                data={results.sports}
                renderItem={renderSportsItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  categoriesContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
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
    marginTop: 2,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  newsItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  newsImage: {
    width: 100,
    height: 80,
    backgroundColor: COLORS.surface,
  },
  newsContent: {
    flex: 1,
    padding: SPACING.md,
  },
  newsCategory: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  newsSource: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sportsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sportsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportsInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  sportsName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sportsType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  trendingTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default SearchScreen;
