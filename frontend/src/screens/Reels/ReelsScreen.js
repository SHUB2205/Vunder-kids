import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { usePost } from '../../context/PostContext';
import { COLORS, SPACING, FONTS } from '../../config/theme';

const { width, height } = Dimensions.get('window');
const REEL_HEIGHT = height - 150;

const ReelsScreen = ({ navigation }) => {
  const { reels, fetchReels, likeReel } = usePost();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  React.useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    setLoading(true);
    await fetchReels();
    setLoading(false);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleLike = async (reelId) => {
    await likeReel(reelId);
  };

  const renderReel = ({ item, index }) => (
    <ReelItem
      reel={item}
      isActive={index === currentIndex}
      onLike={() => handleLike(item._id)}
      onProfilePress={() => navigation.navigate('UserProfile', { userId: item.creator._id })}
    />
  );

  if (loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={REEL_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: REEL_HEIGHT,
          offset: REEL_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

const ReelItem = ({ reel, isActive, onLike, onProfilePress }) => {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likes || 0);
  const [paused, setPaused] = useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      if (isActive && !paused) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isActive, paused]);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike();
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View style={styles.reelContainer}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={togglePlayPause}
      >
        <Video
          ref={videoRef}
          source={{ uri: reel.mediaURL }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={isActive && !paused}
        />
        {paused && (
          <View style={styles.pauseOverlay}>
            <Ionicons name="play" size={60} color={COLORS.white} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={32}
            color={liked ? COLORS.error : COLORS.white}
          />
          <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={30} color={COLORS.white} />
          <Text style={styles.actionText}>{formatCount(reel.comments?.length || 0)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={30} color={COLORS.white} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.reelInfo}>
        <TouchableOpacity style={styles.creatorInfo} onPress={onProfilePress}>
          <Image source={{ uri: reel.creator?.avatar }} style={styles.creatorAvatar} />
          <Text style={styles.creatorName}>
            {reel.creator?.userName || reel.creator?.name}
          </Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {reel.caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {reel.caption}
          </Text>
        )}

        <View style={styles.musicInfo}>
          <Ionicons name="musical-notes" size={14} color={COLORS.white} />
          <Text style={styles.musicText}>Original Audio</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  reelContainer: {
    height: REEL_HEIGHT,
    width: width,
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actions: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  actionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xs,
  },
  reelInfo: {
    position: 'absolute',
    left: SPACING.md,
    right: 60,
    bottom: SPACING.xl,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  creatorName: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
    marginLeft: SPACING.sm,
  },
  followButton: {
    marginLeft: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  caption: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    marginBottom: SPACING.sm,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    marginLeft: SPACING.xs,
  },
});

export default ReelsScreen;
