import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const StoriesBar = ({ stories, onStoryPress, onAddStory, currentUser }) => {
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.creator._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.creator,
        stories: [],
        hasUnviewed: false,
      };
    }
    acc[userId].stories.push(story);
    if (!story.viewedBy?.includes(currentUser?._id)) {
      acc[userId].hasUnviewed = true;
    }
    return acc;
  }, {});

  const storyGroups = Object.values(groupedStories);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={styles.storyItem} onPress={onAddStory}>
          <View style={styles.addStoryContainer}>
            <Image
              source={{ uri: currentUser?.avatar || 'https://via.placeholder.com/60' }}
              style={styles.storyImage}
            />
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.storyUsername} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {storyGroups.map((group) => (
          <TouchableOpacity
            key={group.user._id}
            style={styles.storyItem}
            onPress={() => onStoryPress(group)}
          >
            {group.hasUnviewed ? (
              <LinearGradient
                colors={COLORS.gradient.story}
                style={styles.storyRing}
              >
                <View style={styles.storyImageWrapper}>
                  <Image
                    source={{ uri: group.user.avatar }}
                    style={styles.storyImage}
                  />
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.storyRingViewed}>
                <Image
                  source={{ uri: group.user.avatar }}
                  style={styles.storyImage}
                />
              </View>
            )}
            <Text style={styles.storyUsername} numberOfLines={1}>
              {group.user.userName || group.user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  addStoryContainer: {
    position: 'relative',
    width: 68,
    height: 68,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingViewed: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImageWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.white,
    padding: 2,
  },
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  storyUsername: {
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    textAlign: 'center',
    width: '100%',
  },
});

export default StoriesBar;
