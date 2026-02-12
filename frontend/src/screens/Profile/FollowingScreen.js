import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const FollowingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = following.filter(
        (f) =>
          f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowing(filtered);
    } else {
      setFilteredFollowing(following);
    }
  }, [searchQuery, following]);

  const fetchFollowing = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_USER}/${user._id}/following`);
      setFollowing(response.data.following || []);
      setFilteredFollowing(response.data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.post(API_ENDPOINTS.UNFOLLOW_USER, { userId });
      setFollowing((prev) => prev.filter((f) => f._id !== userId));
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const renderFollowingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.userName || item.name}</Text>
        <Text style={styles.userFullName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.followingButton}
        onPress={() => handleUnfollow(item._id)}
      >
        <Text style={styles.followingButtonText}>Following</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredFollowing}
          renderItem={renderFollowingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Not following anyone yet</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
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
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  avatar: {
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
  userFullName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  followingButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followingButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
});

export default FollowingScreen;
