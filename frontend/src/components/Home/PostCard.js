import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { usePost } from '../../context/PostContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onPress, onProfilePress, onCommentPress }) => {
  const { likePost, deletePost } = usePost();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    await likePost(post._id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post by ${post.creator?.userName || post.creator?.name}: ${post.content || ''}`,
        url: post.mediaURL || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleMenuOption = (option) => {
    setShowMenu(false);
    switch (option) {
      case 'report':
        Alert.alert('Report', 'Post has been reported');
        break;
      case 'copy':
        Alert.alert('Copied', 'Link copied to clipboard');
        break;
      case 'delete':
        Alert.alert(
          'Delete Post',
          'Are you sure you want to delete this post?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deletePost(post._id) },
          ]
        );
        break;
      default:
        break;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString();
  };

  const renderMedia = () => {
    if (!post.mediaURL) return null;

    if (post.mediaType === 'video') {
      return (
        <Video
          source={{ uri: post.mediaURL }}
          style={styles.media}
          resizeMode="cover"
          shouldPlay={false}
          isLooping
          useNativeControls
        />
      );
    }

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        <Image source={{ uri: post.mediaURL }} style={styles.media} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onProfilePress}>
        <Image
          source={{ uri: post.creator?.avatar || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>
            {post.creator?.userName || post.creator?.name}
          </Text>
          {post.creator?.location && (
            <Text style={styles.location}>{post.creator.location}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(true)}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </TouchableOpacity>

      {renderMedia()}

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={26}
              color={liked ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="paper-plane-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {likesCount > 0 && (
          <Text style={styles.likes}>{likesCount.toLocaleString()} likes</Text>
        )}

        {post.content && (
          <Text style={styles.caption} numberOfLines={showFullContent ? undefined : 2}>
            <Text style={styles.captionUsername}>
              {post.creator?.userName || post.creator?.name}{' '}
            </Text>
            {post.content}
          </Text>
        )}

        {post.content && post.content.length > 100 && !showFullContent && (
          <TouchableOpacity onPress={() => setShowFullContent(true)}>
            <Text style={styles.moreText}>more</Text>
          </TouchableOpacity>
        )}

        {post.comments?.length > 0 && (
          <TouchableOpacity onPress={onCommentPress}>
            <Text style={styles.viewComments}>
              View all {post.comments.length} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timestamp}>{formatTime(post.createdAt)}</Text>
      </View>

      {/* Three Dots Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('report')}>
              <Ionicons name="flag-outline" size={20} color={COLORS.text} />
              <Text style={styles.menuText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('copy')}>
              <Ionicons name="link-outline" size={20} color={COLORS.text} />
              <Text style={styles.menuText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={() => handleMenuOption('delete')}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCancel} onPress={() => setShowMenu(false)}>
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  username: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  location: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  media: {
    width: width,
    height: width * 0.75,
    backgroundColor: COLORS.surface,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: SPACING.lg,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  likes: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  caption: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '600',
  },
  moreText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  viewComments: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  menuCancel: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuCancelText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default PostCard;
