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
const REEL_HEIGHT = height - 80; // Full screen minus tab bar

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
  const [muted, setMuted] = useState(false);

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

  const toggleMute = () => {
    setMuted(!muted);
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
          isMuted={muted}
          shouldPlay={isActive && !paused}
        />
        {/* Top Controls - Pause/Mute */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.topControlBtn}>
            <Ionicons name={paused ? 'play' : 'pause'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMute} style={styles.topControlBtn}>
            <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* More Options */}
        <TouchableOpacity style={styles.moreOptions}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Right Side Actions */}
      <View style={styles.actions}>
        {/* Like Button - Thumbs Up like PWA */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
            size={28}
            color={COLORS.white}
          />
          <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbox-outline" size={26} color={COLORS.white} />
          <Text style={styles.actionText}>{formatCount(reel.comments?.length || 0)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="arrow-redo-outline" size={26} color={COLORS.white} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info - Creator and Caption */}
      <View style={styles.reelInfo}>
        <TouchableOpacity style={styles.creatorInfo} onPress={onProfilePress}>
          <Image 
            source={{ uri: reel.creator?.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.creatorAvatar} 
          />
          <Text style={styles.creatorName}>
            {reel.creator?.userName || reel.creator?.name}
          </Text>
        </TouchableOpacity>

        {reel.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption} numberOfLines={2}>
              {reel.caption}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Score Ticker (if match related) */}
      {reel.matchScore && (
        <View style={styles.scoreTicker}>
          <Text style={styles.scoreText}>{reel.matchScore}</Text>
        </View>
      )}
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
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  topControls: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  topControlBtn: {
    padding: SPACING.xs,
  },
  moreOptions: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.md,
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
    bottom: 150,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  actionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    marginTop: 4,
    fontWeight: '500',
  },
  reelInfo: {
    position: 'absolute',
    left: SPACING.md,
    right: 70,
    bottom: SPACING.lg,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  creatorName: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
    marginLeft: SPACING.sm,
  },
  captionContainer: {
    backgroundColor: 'rgba(0, 150, 200, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  caption: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  scoreTicker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 150, 200, 0.9)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  scoreText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default ReelsScreen;
