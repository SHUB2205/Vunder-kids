import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { useMatch } from '../../context/MatchContext';
import StoriesBar from '../../components/Home/StoriesBar';
import PostCard from '../../components/Home/PostCard';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { posts, stories, fetchPosts, fetchStories, createPost, refreshing, setRefreshing } = usePost();
  const { unreadCount: notifCount } = useNotification();
  const { unreadCount: chatCount, connectSocket } = useChat();
  const { matches, fetchMatches } = useMatch();
  
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [posting, setPosting] = useState(false);
  
  // Modals
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreModalType, setScoreModalType] = useState('fisiko');

  useEffect(() => {
    loadData();
    connectSocket();
    fetchMatches();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPosts(), fetchStories()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchStories(), fetchMatches()]);
    setRefreshing(false);
  }, []);

  // Pick image/video for post
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMediaFile(result.assets[0]);
    }
  };

  // Submit post (like PWA Header.js handlePostSubmit)
  const handlePostSubmit = async () => {
    if (!postContent.trim() && !mediaFile) {
      return;
    }

    setPosting(true);
    try {
      const postData = {
        content: postContent,
      };
      if (mediaFile) {
        postData.media = mediaFile;
      }
      
      const result = await createPost(postData);
      if (result.success) {
        setPostContent('');
        setMediaFile(null);
        Alert.alert('Success', 'Post created!');
      } else {
        Alert.alert('Error', result.error || 'Failed to create post');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
    setPosting(false);
  };

  const handleSelectMatch = (match) => {
    setShowScoreModal(false);
    navigation.navigate('SetScore', { match });
  };

  const getUserMatches = () => {
    return (matches || []).filter(m => 
      m.status !== 'completed' && 
      (m.creator?._id === user?._id || 
       m.players?.some(p => p._id === user?._id))
    );
  };

  // Challenge Modal (Set Match) - like PWA ChallengeModal
  const renderMatchModal = () => (
    <Modal
      visible={showMatchModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMatchModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏀 Set Match</Text>
            <TouchableOpacity onPress={() => setShowMatchModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>Create a new match challenge</Text>
            <TouchableOpacity
              style={styles.createMatchBtn}
              onPress={() => {
                setShowMatchModal(false);
                navigation.navigate('CreateMatch');
              }}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.white} />
              <Text style={styles.createMatchBtnText}>Create New Match</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Score Modal - like PWA ScoreModal
  const renderScoreModal = () => (
    <Modal
      visible={showScoreModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowScoreModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Score</Text>
            <TouchableOpacity onPress={() => setShowScoreModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Score Type Toggle */}
          <View style={styles.scoreTypeToggle}>
            <TouchableOpacity
              style={[styles.scoreTypeBtn, scoreModalType === 'fisiko' && styles.scoreTypeBtnActive]}
              onPress={() => setScoreModalType('fisiko')}
            >
              <Text style={[styles.scoreTypeText, scoreModalType === 'fisiko' && styles.scoreTypeTextActive]}>
                Fisiko Matches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreTypeBtn, scoreModalType === 'non-fisiko' && styles.scoreTypeBtnActive]}
              onPress={() => setScoreModalType('non-fisiko')}
            >
              <Text style={[styles.scoreTypeText, scoreModalType === 'non-fisiko' && styles.scoreTypeTextActive]}>
                Non-Fisiko
              </Text>
            </TouchableOpacity>
          </View>

          {scoreModalType === 'fisiko' ? (
            <ScrollView style={styles.matchList}>
              {getUserMatches().length > 0 ? (
                getUserMatches().map((match) => (
                  <TouchableOpacity
                    key={match._id}
                    style={styles.matchItem}
                    onPress={() => handleSelectMatch(match)}
                  >
                    <View style={styles.matchItemIcon}>
                      <Ionicons name="trophy" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.matchItemInfo}>
                      <Text style={styles.matchItemName}>{match.name}</Text>
                      <Text style={styles.matchItemMeta}>
                        {match.sport?.name} • {new Date(match.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyMatches}>
                  <Ionicons name="trophy-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyMatchesText}>No active matches</Text>
                  <Text style={styles.emptyMatchesSubtext}>Create a match first to add scores</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.nonFisikoContainer}>
              <Ionicons name="create-outline" size={48} color={COLORS.primary} />
              <Text style={styles.nonFisikoText}>Add score for a match not on Fisiko</Text>
              <TouchableOpacity
                style={styles.nonFisikoBtn}
                onPress={() => {
                  setShowScoreModal(false);
                  Alert.alert('Coming Soon', 'Non-Fisiko match scoring will be available soon!');
                }}
              >
                <Text style={styles.nonFisikoBtnText}>Add External Score</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Create Post Bar - like PWA Header.js
  const renderCreatePostBar = () => (
    <View style={styles.createPostContainer}>
      <View style={styles.createPostHeader}>
        <Image
          source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
          style={styles.userAvatar}
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.postInput}
            placeholder="Game face on! What's on your mind?"
            placeholderTextColor={COLORS.textLight}
            value={postContent}
            onChangeText={setPostContent}
            multiline
          />
          
          {/* Media Preview */}
          {mediaFile && (
            <View style={styles.mediaPreview}>
              <Image source={{ uri: mediaFile.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeMedia}
                onPress={() => setMediaFile(null)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={pickMedia}>
              <Ionicons name="image-outline" size={18} color="#4A90D9" />
              <Text style={[styles.actionButtonText, { color: '#4A90D9' }]}>Photo/Video</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowMatchModal(true)}
            >
              <Text style={{ fontSize: 16 }}>🏀</Text>
              <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Set Match</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowScoreModal(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color="#28A745" />
              <Text style={[styles.actionButtonText, { color: '#28A745' }]}>Add Score</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.postButton, (!postContent.trim() && !mediaFile) && styles.postButtonDisabled]}
          onPress={handlePostSubmit}
          disabled={(!postContent.trim() && !mediaFile) || posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      {renderCreatePostBar()}
      <StoriesBar
        stories={stories}
        onStoryPress={(story) => navigation.navigate('StoryViewer', { story })}
        onAddStory={() => navigation.navigate('CreateStory')}
        currentUser={user}
      />
    </View>
  );

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
      onProfilePress={() => navigation.navigate('UserProfile', { userId: item.creator._id })}
      onCommentPress={() => navigation.navigate('Comments', { postId: item._id })}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Fisiko</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            {notifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.text} />
            {chatCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{chatCount > 9 ? '9+' : chatCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {renderMatchModal()}
      {renderScoreModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerIcon: {
    position: 'relative',
    padding: SPACING.xs,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  createPostContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  postInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 40,
    maxHeight: 100,
  },
  mediaPreview: {
    marginTop: SPACING.sm,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.md,
  },
  removeMedia: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  actionButtonText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xxl,
  },
  modalBody: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  createMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  createMatchBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  scoreTypeToggle: {
    flexDirection: 'row',
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
  },
  scoreTypeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  scoreTypeBtnActive: {
    backgroundColor: COLORS.text,
  },
  scoreTypeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  scoreTypeTextActive: {
    color: COLORS.white,
  },
  matchList: {
    paddingHorizontal: SPACING.lg,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  matchItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchItemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  matchItemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchItemMeta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  emptyMatches: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyMatchesText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyMatchesSubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  nonFisikoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  nonFisikoText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  nonFisikoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  nonFisikoBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default HomeScreen;
