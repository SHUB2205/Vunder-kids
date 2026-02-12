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

const FollowersScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = followers.filter(
        (f) =>
          f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowers(filtered);
    } else {
      setFilteredFollowers(followers);
    }
  }, [searchQuery, followers]);

  const fetchFollowers = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_USER}/${user._id}/followers`);
      setFollowers(response.data.followers || []);
      setFilteredFollowers(response.data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFollower = async (followerId) => {
    try {
      await api.post(`${API_ENDPOINTS.GET_USER}/remove-follower`, { followerId });
      setFollowers((prev) => prev.filter((f) => f._id !== followerId));
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  const renderFollowerItem = ({ item }) => (
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
        style={styles.removeButton}
        onPress={() => handleRemoveFollower(item._id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Followers</Text>
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
          data={filteredFollowers}
          renderItem={renderFollowerItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No followers yet</Text>
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
  removeButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeButtonText: {
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

export default FollowersScreen;
