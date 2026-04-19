import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Share,
  Alert,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const { width, height } = Dimensions.get('window');
const REEL_HEIGHT = height;

const ReelsScreen = ({ navigation }) => {
  const { reels, fetchReels, likeReel } = usePost();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalMuted, setGlobalMuted] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    setLoading(true);
    await fetchReels();
    setLoading(false);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

  const handleLike = async (reelId) => { await likeReel(reelId); };

  const pickVideoForReel = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        navigation.navigate('UserProfile', { createReel: true, video: result.assets[0] });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open media picker');
    }
  };

  const renderReel = ({ item, index }) => (
    <ReelItem
      reel={item}
      isActive={index === currentIndex}
      onLike={() => handleLike(item._id)}
      onProfilePress={() => navigation.navigate('UserProfile', { userId: item.creator?._id })}
      muted={globalMuted}
      onToggleMute={() => setGlobalMuted((m) => !m)}
      isOwnReel={item.creator?._id === user?._id}
    />
  );

  if (loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Reels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity style={styles.headerCameraBtn} onPress={pickVideoForReel}>
          <Ionicons name="camera-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </SafeAreaView>

      {reels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="videocam-outline" size={72} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No Reels Yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to share a sports reel!</Text>
          <TouchableOpacity style={styles.createReelButton} onPress={pickVideoForReel}>
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.createReelButtonText}>Create Reel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
            getItemLayout={(data, index) => ({ length: REEL_HEIGHT, offset: REEL_HEIGHT * index, index })}
          />
          {/* Reel counter */}
          <View style={styles.reelCounter}>
            <Text style={styles.reelCounterText}>{currentIndex + 1} / {reels.length}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const ReelItem = ({ reel, isActive, onLike, onProfilePress, muted, onToggleMute, isOwnReel }) => {
  const videoRef = useRef(null);
  const navigation = useNavigation();
  const [liked, setLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likes || 0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const heartAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !paused) videoRef.current.playAsync().catch(() => {});
      else videoRef.current.pauseAsync().catch(() => {});
    }
  }, [isActive, paused]);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      if (!liked) {
        setLiked(true);
        setLikesCount(c => c + 1);
        onLike();
        triggerHeartAnimation();
      }
    }
    lastTap.current = now;
  };

  const triggerHeartAnimation = () => {
    setShowHeart(true);
    heartAnim.setValue(0);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true, friction: 3 }),
      Animated.delay(400),
      Animated.timing(heartAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowHeart(false));
  };

  const togglePlayPause = () => setPaused(!paused);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this reel by ${reel.creator?.userName || 'an athlete'}: ${reel.caption || ''}`,
        url: reel.mediaURL || '',
      });
    } catch { }
  };

  const handleComment = () => navigation.navigate('Comments', { postId: reel._id, postType: 'reel' });

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const heartScale = heartAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.4, 1] });
  const heartOpacity = heartAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View style={styles.reelContainer}>
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: reel.mediaURL }}
            style={styles.video}
            resizeMode="cover"
            isLooping
            isMuted={muted}
            shouldPlay={isActive && !paused}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
                setProgress(status.positionMillis || 0);
              }
            }}
          />

          {/* Pause overlay */}
          {paused && (
            <View style={styles.pauseOverlay}>
              <Ionicons name="play-circle" size={72} color="rgba(255,255,255,0.85)" />
            </View>
          )}

          {/* Double-tap heart */}
          {showHeart && (
            <Animated.View style={[styles.heartOverlay, { transform: [{ scale: heartScale }], opacity: heartOpacity }]}>
              <Ionicons name="heart" size={80} color="rgba(255,255,255,0.9)" />
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.topBtn} onPress={togglePlayPause}>
          <Ionicons name={paused ? 'play' : 'pause'} size={20} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBtn} onPress={onToggleMute}>
          <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Right Actions Sidebar */}
      <View style={styles.sidebar}>
        {/* Like */}
        <TouchableOpacity style={styles.sideAction} onPress={handleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? '#FF2D55' : COLORS.white} />
          <Text style={styles.sideActionText}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.sideAction} onPress={handleComment}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color={COLORS.white} />
          <Text style={styles.sideActionText}>{formatCount(reel.comments?.length || 0)}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.sideAction} onPress={handleShare}>
          <Ionicons name="arrow-redo-outline" size={26} color={COLORS.white} />
          <Text style={styles.sideActionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom gradient for caption legibility */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <TouchableOpacity style={styles.creatorRow} onPress={onProfilePress} activeOpacity={0.8}>
          <Image
            source={{ uri: reel.creator?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.creatorAvatar}
          />
          <View style={styles.creatorTextWrap}>
            <Text style={styles.creatorName}>@{reel.creator?.userName || reel.creator?.name}</Text>
          </View>
          {!isOwnReel && (
            <View style={styles.followBtn}>
              <Text style={styles.followBtnText}>View</Text>
            </View>
          )}
        </TouchableOpacity>

        {reel.caption && (
          <TouchableOpacity onPress={() => setCaptionExpanded(!captionExpanded)}>
            <Text style={styles.caption} numberOfLines={captionExpanded ? undefined : 2}>
              {reel.caption}
            </Text>
            {!captionExpanded && reel.caption.length > 80 && (
              <Text style={styles.captionMore}>...more</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Sport tag */}
        {reel.sport && (
          <View style={styles.sportTag}>
            <Ionicons name="basketball-outline" size={12} color={COLORS.white} />
            <Text style={styles.sportTagText}>{reel.sport}</Text>
          </View>
        )}
      </View>

      {/* Live Score Ticker */}
      {reel.matchScore && (
        <View style={styles.scoreTicker}>
          <View style={styles.liveChip}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>
          <Text style={styles.scoreTickerText}>{reel.matchScore}</Text>
        </View>
      )}

      {/* Progress Bar */}
      {duration > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${(progress / duration) * 100}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: COLORS.white, marginTop: SPACING.md, fontSize: FONTS.sizes.md },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  headerCameraBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  reelCounter: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    zIndex: 10,
  },
  reelCounterText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '600' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
  emptyTitle: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: 'bold', marginTop: SPACING.lg },
  emptySubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: FONTS.sizes.md, marginTop: SPACING.sm, textAlign: 'center' },
  createReelButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: SPACING.lg, marginTop: SPACING.xl, gap: SPACING.sm },
  createReelButtonText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },

  reelContainer: { height: REEL_HEIGHT, width, position: 'relative', backgroundColor: '#000' },
  videoWrapper: { flex: 1 },
  video: { flex: 1 },
  pauseOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  heartOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },

  // Top controls
  topControls: { position: 'absolute', top: 100, left: SPACING.md, flexDirection: 'row', gap: SPACING.sm, zIndex: 10 },
  topBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  // Right sidebar - only action buttons, no avatar (avatar in bottomInfo)
  sidebar: { position: 'absolute', right: SPACING.md, bottom: 110, alignItems: 'center', zIndex: 10 },
  sideAction: { alignItems: 'center', marginBottom: SPACING.lg },
  sideActionText: { color: COLORS.white, fontSize: FONTS.sizes.xs, marginTop: 3, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

  // Bottom info
  bottomInfo: { position: 'absolute', left: SPACING.md, right: 72, bottom: 100, zIndex: 10 },
  creatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  creatorAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.white, marginRight: SPACING.sm },
  creatorTextWrap: { flex: 1 },
  creatorName: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  followBtn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  followBtnText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  caption: { color: COLORS.white, fontSize: FONTS.sizes.md, lineHeight: 20, marginBottom: SPACING.xs, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  captionMore: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm },
  sportTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start', gap: 4, marginTop: SPACING.xs },
  sportTagText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '600' },

  // Score ticker
  scoreTicker: { position: 'absolute', bottom: 16, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  liveChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, gap: 3 },
  liveDotSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.white },
  liveLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.white },
  scoreTickerText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600', flex: 1 },

  // Progress bar
  progressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 20 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  bottomGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 },
});

export default ReelsScreen;
