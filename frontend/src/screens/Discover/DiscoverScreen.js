import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const SPORTS_FILTER = [
  { name: 'All', emoji: '🏟️' },
  { name: 'Football', emoji: '⚽' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Badminton', emoji: '🏸' },
];

const DiscoverScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10); // km
  const [showOnMap, setShowOnMap] = useState(user?.showOnMap !== false);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlayers();
    }
  }, [userLocation, selectedSport, radius]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        setUserLocation(coords);

        // Update user location in backend
        api.put(API_ENDPOINTS.UPDATE_LOCATION, coords).catch(() => {});
      } else {
        Alert.alert(
          'Location Required',
          'Please enable location to discover players near you',
          [{ text: 'OK' }]
        );
        setLoading(false);
      }
    } catch (error) {
      console.log('Location error:', error);
      setLoading(false);
    }
  };

  const fetchNearbyPlayers = async () => {
    try {
      const params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius
      };
      if (selectedSport !== 'All') {
        params.sport = selectedSport;
      }

      const res = await api.get(API_ENDPOINTS.GET_NEARBY_USERS, { params });
      setPlayers(res.data.users || []);
    } catch (error) {
      console.error('Fetch nearby players error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNearbyPlayers();
    setRefreshing(false);
  }, [userLocation, selectedSport, radius]);

  const toggleMapVisibility = async () => {
    try {
      const newValue = !showOnMap;
      await api.put(API_ENDPOINTS.UPDATE_MAP_VISIBILITY, { showOnMap: newValue });
      setShowOnMap(newValue);
    } catch (error) {
      Alert.alert('Error', 'Failed to update visibility');
    }
  };

  const handleMessage = (player) => {
    navigation.navigate('Chat', { 
      recipientId: player._id,
      recipientName: player.name,
      recipientAvatar: player.avatar
    });
  };

  const renderPlayerCard = ({ item }) => {
    const sports = item.passions?.slice(0, 3) || [];
    
    return (
      <TouchableOpacity
        style={styles.playerCard}
        onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
            style={styles.playerAvatar}
          />
          <View style={styles.playerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.playerName}>{item.name}</Text>
              {item.level && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lv.{item.level}</Text>
                </View>
              )}
            </View>
            <Text style={styles.playerUsername}>@{item.userName}</Text>
            {item.distance !== undefined && (
              <View style={styles.distanceRow}>
                <Ionicons name="location" size={12} color={COLORS.primary} />
                <Text style={styles.distanceText}>{item.distance} km away</Text>
              </View>
            )}
          </View>
        </View>

        {item.bio && (
          <Text style={styles.playerBio} numberOfLines={2}>{item.bio}</Text>
        )}

        {sports.length > 0 && (
          <View style={styles.sportsRow}>
            {sports.map((sport, idx) => (
              <View key={idx} style={styles.sportChip}>
                <Text style={styles.sportEmoji}>{getSportEmoji(sport.name || sport)}</Text>
                <Text style={styles.sportName}>{sport.name || sport}</Text>
              </View>
            ))}
          </View>
        )}

        {item.stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.stats.totalMatches || 0}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.stats.wins || 0}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {item.stats.totalMatches > 0 
                  ? Math.round((item.stats.wins / item.stats.totalMatches) * 100) 
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
          >
            <Ionicons name="person-outline" size={16} color={COLORS.primary} />
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessage(item)}
          >
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.white} />
            <Text style={styles.messageText}>Message</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Visibility Toggle */}
      <View style={styles.visibilityCard}>
        <View style={styles.visibilityInfo}>
          <Ionicons 
            name={showOnMap ? 'eye' : 'eye-off'} 
            size={24} 
            color={showOnMap ? COLORS.success : COLORS.textSecondary} 
          />
          <View style={styles.visibilityText}>
            <Text style={styles.visibilityTitle}>
              {showOnMap ? 'You are visible' : 'You are hidden'}
            </Text>
            <Text style={styles.visibilitySubtitle}>
              {showOnMap ? 'Other players can find you' : 'Turn on to let others find you'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.visibilityToggle, showOnMap && styles.visibilityToggleActive]}
          onPress={toggleMapVisibility}
        >
          <View style={[styles.toggleKnob, showOnMap && styles.toggleKnobActive]} />
        </TouchableOpacity>
      </View>

      {/* Sports Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportsFilter}
      >
        {SPORTS_FILTER.map((sport) => (
          <TouchableOpacity
            key={sport.name}
            style={[
              styles.sportFilterChip,
              selectedSport === sport.name && styles.sportFilterChipActive
            ]}
            onPress={() => setSelectedSport(sport.name)}
          >
            <Text style={styles.sportFilterEmoji}>{sport.emoji}</Text>
            <Text style={[
              styles.sportFilterText,
              selectedSport === sport.name && styles.sportFilterTextActive
            ]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Radius Selector */}
      <View style={styles.radiusSection}>
        <Text style={styles.radiusLabel}>Search Radius</Text>
        <View style={styles.radiusOptions}>
          {[5, 10, 25, 50].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>
                {r} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {selectedSport !== 'All' ? `${getSportEmoji(selectedSport)} ${selectedSport} Players` : '🏃 Players Nearby'}
        </Text>
        <Text style={styles.resultsCount}>{players.length} found</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover Players</Text>
          <Text style={styles.headerSubtitle}>Find players near you</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Messages')}
        >
          <Ionicons name="chatbubbles" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding players near you...</Text>
        </View>
      ) : !userLocation ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Location Required</Text>
          <Text style={styles.emptySubtitle}>Enable location to discover players</Text>
          <TouchableOpacity style={styles.enableButton} onPress={requestLocation}>
            <Text style={styles.enableButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={players}
          renderItem={renderPlayerCard}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No players found</Text>
              <Text style={styles.emptySubtitle}>
                Try increasing the search radius or changing the sport filter
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  visibilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  visibilityText: {
    marginLeft: SPACING.md,
  },
  visibilityTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  visibilitySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  visibilityToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  visibilityToggleActive: {
    backgroundColor: COLORS.success,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  sportsFilter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sportFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sportFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportFilterEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  sportFilterText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  sportFilterTextActive: {
    color: COLORS.white,
  },
  radiusSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  radiusLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  radiusChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radiusChipActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  radiusText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  radiusTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultsCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  playerCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  playerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  levelBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  levelText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  playerUsername: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  distanceText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginLeft: 4,
  },
  playerBio: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  sportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  sportEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  sportName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  viewProfileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewProfileText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  enableButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  enableButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default DiscoverScreen;
