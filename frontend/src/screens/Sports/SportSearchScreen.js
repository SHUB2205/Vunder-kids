import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const SportSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sports, setSports] = useState([]);
  const [trendingSports, setTrendingSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchTrendingSports();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchSports(searchQuery);
      } else {
        setSports([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchTrendingSports = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_TRENDING_SPORTS);
      setTrendingSports(response.data.sports || []);
    } catch (error) {
      console.error('Error fetching trending sports:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const searchSports = async (query) => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.SEARCH_SPORTS_TAGS}?q=${encodeURIComponent(query)}`);
      setSports(response.data.sports || []);
    } catch (error) {
      console.error('Error searching sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const renderSportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sportItem}
      onPress={() => navigation.navigate('SportProfile', { sportName: item.name })}
    >
      <View style={styles.sportIconContainer}>
        <Text style={styles.sportEmoji}>{getSportEmoji(item.name)}</Text>
      </View>
      <View style={styles.sportInfo}>
        <Text style={styles.sportName}>{item.name}</Text>
        <Text style={styles.sportStats}>
          {formatNumber(item.postCount)} posts • {formatNumber(item.totalLikes)} likes
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => navigation.navigate('SportProfile', { sportName: item.name })}
    >
      <View style={styles.trendingRank}>
        <Text style={styles.trendingRankText}>{index + 1}</Text>
      </View>
      <View style={styles.trendingIconContainer}>
        <Text style={styles.trendingEmoji}>{getSportEmoji(item.name)}</Text>
      </View>
      <View style={styles.trendingInfo}>
        <Text style={styles.trendingName}>{item.name}</Text>
        <Text style={styles.trendingStats}>
          {formatNumber(item.postCount)} posts this week
        </Text>
      </View>
      {item.engagement > 100 && (
        <View style={styles.hotBadge}>
          <Ionicons name="flame" size={12} color={COLORS.white} />
          <Text style={styles.hotText}>Hot</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Ionicons name="trending-up" size={20} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>Trending Sports</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {searchQuery ? (
        <>
          <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No sports found for "{searchQuery}"</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </>
      ) : (
        <>
          <Ionicons name="football-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Search for a sport</Text>
          <Text style={styles.emptySubtext}>Find posts about your favorite sports</Text>
        </>
      )}
    </View>
  );

  const displayData = searchQuery.trim() ? sports : trendingSports;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Sports</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sports..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={displayData}
          renderItem={searchQuery.trim() ? renderSportItem : renderTrendingItem}
          keyExtractor={(item, index) => item.name + index}
          ListHeaderComponent={!searchQuery.trim() && trendingSports.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {loading && (
        <View style={styles.searchingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
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
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Sport item styles
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: 24,
  },
  sportInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  sportName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  sportStats: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Trending item styles
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  trendingRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  trendingRankText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  trendingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingEmoji: {
    fontSize: 22,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  trendingName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  trendingStats: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 2,
  },
  hotText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  searchingOverlay: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default SportSearchScreen;
