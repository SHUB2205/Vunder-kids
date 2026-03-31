import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - SPACING.md * 4) / 3;

const SportProfileScreen = ({ navigation, route }) => {
  const { sportName } = route.params;
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fetchPosts = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      
      const response = await api.get(`${API_ENDPOINTS.GET_SPORT_POSTS(sportName)}?page=${pageNum}`);
      
      if (pageNum === 1 || refresh) {
        setPosts(response.data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.data.posts || [])]);
      }
      
      setStats(response.data.stats || { totalPosts: 0, totalLikes: 0, contributors: 0 });
      setHasMore(pageNum < response.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching sport posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sportName]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleRefresh = () => {
    fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      {item.mediaType === 'video' ? (
        <View style={styles.gridMedia}>
          <Video
            source={{ uri: item.mediaURL }}
            style={styles.gridImage}
            resizeMode="cover"
            shouldPlay={false}
          />
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={16} color={COLORS.white} />
          </View>
        </View>
      ) : item.mediaURL ? (
        <Image source={{ uri: item.mediaURL }} style={styles.gridImage} />
      ) : (
        <View style={styles.gridPlaceholder}>
          <Text style={styles.gridPlaceholderText} numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      )}
      {item.likes > 0 && (
        <View style={styles.gridLikes}>
          <Ionicons name="heart" size={12} color={COLORS.white} />
          <Text style={styles.gridLikesText}>{formatNumber(item.likes)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      {item.mediaURL && (
        <View style={styles.listMediaContainer}>
          {item.mediaType === 'video' ? (
            <>
              <Video
                source={{ uri: item.mediaURL }}
                style={styles.listMedia}
                resizeMode="cover"
                shouldPlay={false}
              />
              <View style={styles.listVideoIndicator}>
                <Ionicons name="play-circle" size={40} color={COLORS.white} />
              </View>
            </>
          ) : (
            <Image source={{ uri: item.mediaURL }} style={styles.listMedia} />
          )}
        </View>
      )}
      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <TouchableOpacity
            style={styles.listCreator}
            onPress={() => navigation.navigate('UserProfile', { userId: item.creator?._id })}
          >
            <Image
              source={{ uri: item.creator?.avatar || 'https://via.placeholder.com/32' }}
              style={styles.listAvatar}
            />
            <Text style={styles.listUsername}>{item.creator?.userName || item.creator?.name}</Text>
          </TouchableOpacity>
          <Text style={styles.listTime}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {item.content && (
          <Text style={styles.listText} numberOfLines={3}>{item.content}</Text>
        )}
        <View style={styles.listStats}>
          <View style={styles.listStat}>
            <Ionicons name="heart-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.listStatText}>{formatNumber(item.likes)}</Text>
          </View>
          <View style={styles.listStat}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.listStatText}>{item.comments?.length || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.sportIconContainer}>
        <Text style={styles.sportEmoji}>{getSportEmoji(sportName)}</Text>
      </View>
      <Text style={styles.sportName}>{sportName}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(stats.totalPosts)}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(stats.totalLikes)}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(stats.contributors)}</Text>
          <Text style={styles.statLabel}>Contributors</Text>
        </View>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons 
            name="grid" 
            size={20} 
            color={viewMode === 'grid' ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={viewMode === 'list' ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to post about {sportName}!
      </Text>
      <TouchableOpacity
        style={styles.createPostBtn}
        onPress={() => navigation.navigate('CreatePost', { sport: sportName })}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.createPostBtnText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{sportName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sportName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost', { sport: sportName })}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item._id}
        numColumns={viewMode === 'grid' ? 3 : 1}
        key={viewMode}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          posts.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && posts.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} color={COLORS.primary} />
          ) : null
        }
      />
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
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  sportIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sportEmoji: {
    fontSize: 50,
  },
  sportName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  
  // Grid styles
  gridItem: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  gridMedia: {
    flex: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  gridPlaceholderText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  gridLikes: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridLikesText: {
    fontSize: 10,
    color: COLORS.white,
    marginLeft: 2,
  },
  
  // List styles
  listItem: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  listMediaContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  listMedia: {
    width: '100%',
    height: '100%',
  },
  listVideoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  listContent: {
    padding: SPACING.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listCreator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  listUsername: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  listTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  listText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  listStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listStatText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  createPostBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
  },
});

export default SportProfileScreen;
