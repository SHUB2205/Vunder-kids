import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../../context/MatchContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const FacilitiesScreen = ({ navigation }) => {
  const { facilities, fetchFacilities } = useMatch();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Swimming'];

  useEffect(() => {
    fetchFacilities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFacilities();
    setRefreshing(false);
  };

  const filteredFacilities = selectedSport === 'All'
    ? facilities
    : facilities.filter(f => f.sports?.includes(selectedSport));

  const renderFacilityCard = ({ item }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => navigation.navigate('BookFacility', { facility: item })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300x200' }}
        style={styles.facilityImage}
      />
      <View style={styles.facilityContent}>
        <View style={styles.facilityHeader}>
          <Text style={styles.facilityName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.rating}>{item.rating || '4.5'}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.sportsRow}>
          {item.sports?.slice(0, 3).map((sport, index) => (
            <View key={index} style={styles.sportTag}>
              <Text style={styles.sportTagText}>{sport}</Text>
            </View>
          ))}
          {item.sports?.length > 3 && (
            <Text style={styles.moreSports}>+{item.sports.length - 3}</Text>
          )}
        </View>

        <View style={styles.facilityFooter}>
          <Text style={styles.price}>
            ₹{item.pricePerHour || '500'}<Text style={styles.priceUnit}>/hour</Text>
          </Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('BookFacility', { facility: item })}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facilities</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={sports}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSport === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSport(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSport === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No facilities found</Text>
            <Text style={styles.emptySubtext}>Try a different filter</Text>
          </View>
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
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
  },
  facilityCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facilityImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surface,
  },
  facilityContent: {
    padding: SPACING.lg,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  facilityName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  rating: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sportsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sportTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  sportTagText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.primary,
  },
  moreSports: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  facilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
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

export default FacilitiesScreen;
