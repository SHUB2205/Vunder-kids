import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const SPORTS_LIST = [
  { name: 'All', emoji: '🏟️' },
  { name: 'Football', emoji: '⚽' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Golf', emoji: '⛳' },
];

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
  { label: 'Rating', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const POPULAR_LOCATIONS = [
  { name: 'Current Location', icon: 'navigate', isCurrentLocation: true },
  { name: 'Tampa, FL', country: 'USA', icon: 'location' },
  { name: 'Miami, FL', country: 'USA', icon: 'location' },
  { name: 'New York, NY', country: 'USA', icon: 'location' },
  { name: 'Los Angeles, CA', country: 'USA', icon: 'location' },
  { name: 'Delhi', country: 'India', icon: 'location' },
  { name: 'Mumbai', country: 'India', icon: 'location' },
  { name: 'Budapest', country: 'Hungary', icon: 'location' },
  { name: 'London', country: 'UK', icon: 'location' },
];

const BookingHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [featuredFacilities, setFeaturedFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  
  // Location
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('Select Location');

  useEffect(() => {
    requestLocation();
    loadData();
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [selectedSport, selectedCity, sortBy]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
        
        // Reverse geocode to get city name
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        if (address) {
          setLocationName(address.city || address.subregion || 'Current Location');
          setSelectedCity(address.city || '');
        }

        // Update user location in backend
        api.put(API_ENDPOINTS.UPDATE_LOCATION, {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }).catch(() => {});
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchFacilities(), fetchFeaturedFacilities()]);
    setLoading(false);
  };

  const fetchFacilities = async () => {
    try {
      const params = {};
      if (selectedSport && selectedSport !== 'All') params.sport = selectedSport;
      if (selectedCity) params.city = selectedCity;
      if (searchQuery) params.name = searchQuery;
      if (sortBy !== 'recommended') params.sortBy = sortBy;

      const res = await api.get(API_ENDPOINTS.GET_FACILITIES, { params });
      setFacilities(res.data.facilities || []);
    } catch (error) {
      console.error('Fetch facilities error:', error);
    }
  };

  const fetchFeaturedFacilities = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_FEATURED_FACILITIES);
      setFeaturedFacilities(res.data.facilities || []);
    } catch (error) {
      console.error('Fetch featured error:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedSport, selectedCity, sortBy]);

  const handleSearch = () => {
    fetchFacilities();
  };

  const handleSelectLocation = async (location) => {
    if (location.isCurrentLocation) {
      await requestLocation();
    } else {
      setLocationName(location.name);
      setSelectedCity(location.name.split(',')[0].trim());
    }
    setShowLocationModal(false);
    setLocationSearchQuery('');
  };

  const getFilteredLocations = () => {
    if (!locationSearchQuery) return POPULAR_LOCATIONS;
    return POPULAR_LOCATIONS.filter(loc => 
      loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );
  };

  const renderFacilityCard = ({ item }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => navigation.navigate('FacilityDetail', { facilityId: item._id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/400x200?text=Facility' }}
        style={styles.facilityImage}
      />
      {item.isFeatured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={10} color={COLORS.white} />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      <View style={styles.facilityContent}>
        <View style={styles.facilityHeader}>
          <Text style={styles.facilityName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.city || item.location}
          </Text>
        </View>

        <View style={styles.sportsRow}>
          {item.sports?.slice(0, 3).map((sport, idx) => (
            <View key={idx} style={styles.sportChip}>
              <Text style={styles.sportEmoji}>{getSportEmoji(sport)}</Text>
              <Text style={styles.sportChipText}>{sport}</Text>
            </View>
          ))}
          {item.sports?.length > 3 && (
            <Text style={styles.moreSports}>+{item.sports.length - 3}</Text>
          )}
        </View>

        <View style={styles.facilityFooter}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.price}>
              ₹{item.pricePerHour}<Text style={styles.priceUnit}>/hr</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('FacilityDetail', { facilityId: item._id })}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCard = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('FacilityDetail', { facilityId: item._id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300x180?text=Facility' }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.featuredMeta}>
            <Ionicons name="location" size={12} color={COLORS.white} />
            <Text style={styles.featuredLocation}>{item.city}</Text>
            <Text style={styles.featuredPrice}>₹{item.pricePerHour}/hr</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Search & Location Bar */}
      <View style={styles.searchSection}>
        <TouchableOpacity style={styles.locationSelector} onPress={() => setShowLocationModal(true)}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={styles.locationValue} numberOfLines={1}>{locationName}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search facilities..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchFacilities(); }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sports Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportsFilter}
      >
        {SPORTS_LIST.map((sport) => (
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

      {/* Sort & Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical" size={16} color={COLORS.text} />
          <Text style={styles.filterButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options" size={16} color={COLORS.text} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>{facilities.length} venues found</Text>
        </View>
      </View>

      {/* Featured Section */}
      {featuredFacilities.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Featured Venues</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featuredFacilities}
            renderItem={renderFeaturedCard}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      )}

      {/* All Venues Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedSport !== 'All' ? `${getSportEmoji(selectedSport)} ${selectedSport} Venues` : '🏟️ All Venues'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Player'} 👋</Text>
          <Text style={styles.headerTitle}>Find & Book Venues</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Ionicons name="calendar" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding venues near you...</Text>
        </View>
      ) : (
        <FlatList
          data={facilities}
          renderItem={renderFacilityCard}
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
              <Ionicons name="business-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No venues found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters or search</Text>
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
                onPress={() => { setSortBy(option.value); setShowSortModal(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.locationModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Location</Text>
            
            {/* Search Bar */}
            <View style={styles.locationSearchBar}>
              <Ionicons name="search" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.locationSearchInput}
                placeholder="Search city or area..."
                placeholderTextColor={COLORS.textLight}
                value={locationSearchQuery}
                onChangeText={setLocationSearchQuery}
              />
              {locationSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLocationSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Location List */}
            <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
              {getFilteredLocations().map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.locationItem}
                  onPress={() => handleSelectLocation(location)}
                >
                  <View style={[
                    styles.locationItemIcon,
                    location.isCurrentLocation && styles.locationItemIconCurrent
                  ]}>
                    <Ionicons 
                      name={location.icon} 
                      size={20} 
                      color={location.isCurrentLocation ? COLORS.white : COLORS.primary} 
                    />
                  </View>
                  <View style={styles.locationItemInfo}>
                    <Text style={styles.locationItemName}>{location.name}</Text>
                    {location.country && (
                      <Text style={styles.locationItemCountry}>{location.country}</Text>
                    )}
                  </View>
                  {locationName === location.name && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Add Facility Button */}
      <TouchableOpacity 
        style={styles.addFacilityFab}
        onPress={() => navigation.navigate('AddFacility')}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
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
  },
  greeting: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  locationInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  locationLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  locationValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sportsFilter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  sportFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  filterButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  resultCount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  resultCountText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  featuredSection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: SPACING.lg,
  },
  featuredCard: {
    width: 280,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: SPACING.md,
  },
  featuredName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  featuredLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  featuredPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  facilityCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  facilityImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surface,
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  featuredText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
  facilityContent: {
    padding: SPACING.md,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  facilityName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  sportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
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
  sportChipText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.primary,
  },
  moreSports: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    alignSelf: 'center',
  },
  facilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  priceUnit: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  bookButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: SPACING.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sortOptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Location Modal
  locationModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    maxHeight: '70%',
  },
  locationSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
  },
  locationSearchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  locationList: {
    maxHeight: 400,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationItemIconCurrent: {
    backgroundColor: COLORS.primary,
  },
  locationItemInfo: {
    flex: 1,
  },
  locationItemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  locationItemCountry: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Floating Add Button
  addFacilityFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});

export default BookingHomeScreen;
