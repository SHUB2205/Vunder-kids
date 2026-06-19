import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import api from '../../config/axios';

const SavedScreen = ({ navigation }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      // Fetch saved matches and bookings
      const [matchesRes, bookingsRes] = await Promise.all([
        api.get('/matches/my?tab=saved').catch(() => ({ data: { matches: [] } })),
        api.get('/facilities/bookings/my').catch(() => ({ data: { bookings: [] } })),
      ]);
      
      const items = [
        ...(matchesRes.data.matches || []).map(m => ({ ...m, type: 'match' })),
        ...(bookingsRes.data.bookings || []).filter(b => b.isSaved).map(b => ({ ...b, type: 'booking' })),
      ];
      
      setSavedItems(items);
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (activeTab === 'all') return savedItems;
    return savedItems.filter(item => item.type === activeTab);
  };

  const renderItem = ({ item }) => {
    if (item.type === 'match') {
      return (
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => navigation.navigate('MatchDetail', { match: item })}
        >
          <View style={[styles.itemIcon, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="trophy" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.name || 'Match'}</Text>
            <Text style={styles.itemSubtitle}>
              {item.sportName} • {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.unsaveButton}>
            <Ionicons name="bookmark" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    if (item.type === 'booking') {
      return (
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => navigation.navigate('FacilityDetail', { facilityId: item.facility?._id })}
        >
          <Image
            source={{ uri: item.facility?.image || 'https://via.placeholder.com/60' }}
            style={styles.facilityImage}
          />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.facility?.name || 'Facility'}</Text>
            <Text style={styles.itemSubtitle}>
              {new Date(item.date).toLocaleDateString()} • {item.startTime}
            </Text>
          </View>
          <TouchableOpacity style={styles.unsaveButton}>
            <Ionicons name="bookmark" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No Saved Items</Text>
      <Text style={styles.emptySubtitle}>
        Items you save will appear here for quick access
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'match', label: 'Matches' },
          { key: 'booking', label: 'Bookings' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  facilityImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unsaveButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default SavedScreen;
