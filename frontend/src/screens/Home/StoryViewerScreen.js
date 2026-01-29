import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePost } from '../../context/PostContext';
import { COLORS, SPACING, FONTS } from '../../config/theme';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

const StoryViewerScreen = ({ navigation, route }) => {
  const { story } = route.params;
  const { viewStory } = usePost();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef(null);

  const stories = story.stories || [story];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    startProgress();
    viewStory(currentStory._id);

    return () => {
      if (animation.current) {
        animation.current.stop();
      }
    };
  }, [currentIndex]);

  const startProgress = () => {
    progress.setValue(0);
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    animation.current.start(({ finished }) => {
      if (finished) {
        goToNext();
      }
    });
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePress = (e) => {
    const touchX = e.nativeEvent.locationX;
    if (touchX < width / 3) {
      goToPrev();
    } else if (touchX > (width * 2) / 3) {
      goToNext();
    }
  };

  const handleLongPress = () => {
    setPaused(true);
    if (animation.current) {
      animation.current.stop();
    }
  };

  const handlePressOut = () => {
    if (paused) {
      setPaused(false);
      animation.current = Animated.timing(progress, {
        toValue: 1,
        duration: STORY_DURATION * (1 - progress._value),
        useNativeDriver: false,
      });
      animation.current.start(({ finished }) => {
        if (finished) goToNext();
      });
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffMs = now - storyDate;
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return storyDate.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.storyContainer}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
      >
        <Image
          source={{ uri: currentStory.mediaURL }}
          style={styles.storyImage}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                        ? progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: story.user?.avatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.username}>
                {story.user?.userName || story.user?.name}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(currentStory.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.footer}>
        <View style={styles.replyContainer}>
          <Ionicons name="chatbubble-outline" size={24} color={COLORS.white} />
          <Text style={styles.replyText}>Send message</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  storyContainer: {
    flex: 1,
  },
  storyImage: {
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  username: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONTS.sizes.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  replyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  replyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONTS.sizes.md,
  },
});

export default StoryViewerScreen;
