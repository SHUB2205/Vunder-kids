import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const SPORTS_LIST = [
  'Football', 'Basketball', 'Tennis', 'Cricket', 'Baseball',
  'Soccer', 'Golf', 'Swimming', 'Running', 'Cycling',
  'Boxing', 'MMA', 'Wrestling', 'Volleyball', 'Badminton',
  'Table Tennis', 'Hockey', 'Rugby', 'Skiing', 'Snowboarding',
  'Surfing', 'Skateboarding', 'Gymnastics', 'Athletics', 'Pickleball',
  'Padel', 'Squash', 'Lacrosse', 'Handball', 'Archery',
];

const CreatePostScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { createPost } = usePost();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState(route?.params?.sport || null);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [sportSearch, setSportSearch] = useState('');

  const filteredSports = SPORTS_LIST.filter(sport =>
    sport.toLowerCase().includes(sportSearch.toLowerCase())
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        fileName: asset.fileName || 'media',
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia({
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        fileName: 'photo.jpg',
      });
    }
  };

  const handlePost = async () => {
    if (!content && !media) {
      Alert.alert('Error', 'Please add some content or media');
      return;
    }

    setLoading(true);
    const result = await createPost({ content, media, sport: selectedSport });
    setLoading(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Failed to create post');
    }
  };

  const removeMedia = () => {
    setMedia(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          style={[styles.postButton, (!content && !media) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading || (!content && !media)}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.postButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userInfo}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{user?.userName || user?.name}</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.textLight}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {media && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: media.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeMedia} onPress={removeMedia}>
              <Ionicons name="close-circle" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Sport Tag Section */}
        <View style={styles.sportTagSection}>
          <View style={styles.sportTagHeader}>
            <Ionicons name="football-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sportTagLabel}>Tag a Sport</Text>
          </View>
          <TouchableOpacity
            style={styles.sportTagButton}
            onPress={() => setShowSportPicker(true)}
          >
            {selectedSport ? (
              <View style={styles.selectedSportTag}>
                <Text style={styles.sportEmoji}>{getSportEmoji(selectedSport)}</Text>
                <Text style={styles.selectedSportText}>{selectedSport}</Text>
                <TouchableOpacity onPress={() => setSelectedSport(null)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addSportTag}>
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                <Text style={styles.addSportText}>Tap to select a sport</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.sportTagHint}>
            Your post will appear on the sport's profile page
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Ionicons name="images-outline" size={24} color={COLORS.primary} />
          <Text style={styles.mediaButtonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
          <Text style={styles.mediaButtonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {/* Sport Picker Modal */}
      <Modal
        visible={showSportPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSportPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport</Text>
              <TouchableOpacity onPress={() => setShowSportPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search sports..."
                placeholderTextColor={COLORS.textSecondary}
                value={sportSearch}
                onChangeText={setSportSearch}
              />
            </View>

            <FlatList
              data={filteredSports}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sportItem}
                  onPress={() => {
                    setSelectedSport(item);
                    setShowSportPicker(false);
                    setSportSearch('');
                  }}
                >
                  <Text style={styles.sportItemEmoji}>{getSportEmoji(item)}</Text>
                  <Text style={styles.sportItemText}>{item}</Text>
                  {selectedSport === item && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sportsList}
            />
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  username: {
    marginLeft: SPACING.md,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    minHeight: 120,
  },
  mediaPreview: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  removeMedia: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xl,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mediaButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Sport Tag styles
  sportTagSection: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
  },
  sportTagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sportTagLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  sportTagButton: {
    marginBottom: SPACING.sm,
  },
  selectedSportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    gap: SPACING.sm,
  },
  sportEmoji: {
    fontSize: 18,
  },
  selectedSportText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.primary,
  },
  addSportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addSportText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
  },
  sportTagHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  // Modal styles
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sportsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sportItemEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  sportItemText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
});

export default CreatePostScreen;
