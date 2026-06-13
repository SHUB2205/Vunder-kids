import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 2) / 3;

const ManagePhotosScreen = ({ navigation, route }) => {
  const { facilityId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facility, setFacility] = useState(null);
  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    fetchFacilityPhotos();
  }, []);

  const fetchFacilityPhotos = async () => {
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      const res = await api.get(API_ENDPOINTS.GET_FACILITY(facilityId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fac = res.data.facility;
      setFacility(fac);
      setImages(fac.images || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    if (images.length >= 10) {
      Alert.alert('Limit Reached', 'Maximum 10 photos allowed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const takePhoto = async () => {
    if (images.length >= 10) {
      Alert.alert('Limit Reached', 'Maximum 10 photos allowed');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newImages = images.filter((_, i) => i !== index);
          setImages(newImages);
          if (coverIndex === index) {
            setCoverIndex(0);
          } else if (coverIndex > index) {
            setCoverIndex(coverIndex - 1);
          }
        }
      }
    ]);
  };

  const setCover = (index) => {
    setCoverIndex(index);
    // Move cover image to first position
    const newImages = [...images];
    const [coverImage] = newImages.splice(index, 1);
    newImages.unshift(coverImage);
    setImages(newImages);
    setCoverIndex(0);
  };

  const handleSave = async () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('ownerToken');
      
      // In a real app, you would upload new images to cloud storage first
      // For now, we'll just update the images array
      await api.put(API_ENDPOINTS.UPDATE_FACILITY(facilityId), {
        images,
        image: images[0], // Cover image
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Photos updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update photos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Photos</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Add Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facility Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Add up to 10 photos. First photo will be the cover.
          </Text>

          <View style={styles.addButtonsRow}>
            <TouchableOpacity style={styles.addButton} onPress={pickImages}>
              <Ionicons name="images-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.photoCount}>{images.length}/10 photos</Text>
        </View>

        {/* Photos Grid */}
        {images.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.photosGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri }} style={styles.photo} />
                  
                  {/* Cover Badge */}
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  )}
                  
                  {/* Actions */}
                  <View style={styles.photoActions}>
                    {index !== 0 && (
                      <TouchableOpacity
                        style={styles.photoActionButton}
                        onPress={() => setCover(index)}
                      >
                        <Ionicons name="star-outline" size={16} color={COLORS.white} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.photoActionButton, styles.deleteButton]}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {/* Add More Button */}
              {images.length < 10 && (
                <TouchableOpacity style={styles.addMoreButton} onPress={pickImages}>
                  <Ionicons name="add" size={32} color={COLORS.primary} />
                  <Text style={styles.addMoreText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Photos Yet</Text>
            <Text style={styles.emptySubtitle}>Add photos to showcase your facility</Text>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Photo Tips</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Use high-quality, well-lit photos</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Show different areas of your facility</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Include photos of amenities</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Add action shots if possible</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  photoCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  photoContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  coverBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  photoActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  photoActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: COLORS.error + 'CC',
  },
  addMoreButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});

export default ManagePhotosScreen;
